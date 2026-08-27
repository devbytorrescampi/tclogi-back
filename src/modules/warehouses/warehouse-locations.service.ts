import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { WarehouseLocation, WarehouseLocationType } from './warehouse-location.entity';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';
import { BulkCreateLocationsDto, LocationCodeStyle } from './dto/bulk-create-locations.dto';

const PARENT_TYPE: Record<WarehouseLocationType, WarehouseLocationType | null> = {
  [WarehouseLocationType.RACK]: null,
  [WarehouseLocationType.SHELF]: WarehouseLocationType.RACK,
  [WarehouseLocationType.BIN]: WarehouseLocationType.SHELF,
};

function generateCode(index: number, style: LocationCodeStyle): string {
  if (style === LocationCodeStyle.ALPHA) {
    // Excel-style base-26 letters: 1=A, 2=B, ..., 26=Z, 27=AA, 28=AB, ...
    let n = index;
    let code = '';
    while (n > 0) {
      n -= 1;
      code = String.fromCharCode(65 + (n % 26)) + code;
      n = Math.floor(n / 26);
    }
    return code;
  }
  return String(index);
}

// Existing sibling codes may come from free-form manual entry, so a plain
// "count + 1" offset can collide with one of them — walk indexes until each
// generated code is actually free instead of assuming a clean sequence.
function generateFreeCodes(
  count: number,
  style: LocationCodeStyle,
  existingCodes: Set<string>,
): string[] {
  const codes: string[] = [];
  let index = 1;
  while (codes.length < count) {
    const candidate = generateCode(index, style);
    if (!existingCodes.has(candidate)) {
      codes.push(candidate);
      existingCodes.add(candidate);
    }
    index += 1;
  }
  return codes;
}

interface NewLocation {
  tenantId: string;
  warehouseId: string;
  parentLocationId: string | null;
  type: WarehouseLocationType;
  code: string;
  fullPath: string;
}

@Injectable()
export class WarehouseLocationsService {
  constructor(
    @InjectRepository(WarehouseLocation)
    private readonly locationRepo: Repository<WarehouseLocation>,
  ) {}

  async create(tenantId: string, warehouseId: string, dto: CreateWarehouseLocationDto) {
    const expectedParentType = PARENT_TYPE[dto.type];

    let parent: WarehouseLocation | null = null;
    if (expectedParentType) {
      if (!dto.parentLocationId) {
        throw new BadRequestException(
          `Un ${dto.type.toLowerCase()} necesita un ${expectedParentType.toLowerCase()} padre`,
        );
      }
      parent = await this.locationRepo.findOne({
        where: { id: dto.parentLocationId, tenantId, warehouseId },
      });
      if (!parent || parent.type !== expectedParentType) {
        throw new BadRequestException(
          `El padre indicado debe ser de tipo ${expectedParentType}`,
        );
      }
    } else if (dto.parentLocationId) {
      throw new BadRequestException(`Un ${dto.type.toLowerCase()} no puede tener padre`);
    }

    const fullPath = parent ? `${parent.fullPath}-${dto.code}` : dto.code;

    const location = this.locationRepo.create({
      tenantId,
      warehouseId,
      parentLocationId: parent?.id ?? null,
      type: dto.type,
      code: dto.code,
      fullPath,
    });
    return this.locationRepo.save(location);
  }

  // Bulk-generates siblings of `type` under one or every parent of the
  // required parent type — e.g. "5 shelves under rack A" or "3 bins under
  // every shelf in the warehouse" in a single call. Codes are either
  // auto-numbered/lettered (skipping whatever already exists) or, with
  // codeStyle = CUSTOM, taken verbatim from `customCodes` in order.
  //
  // Everything is read in one batched query and written with a single
  // multi-row INSERT — with hundreds of rows, awaiting one save() per row
  // (a full network round-trip each) made this take tens of seconds.
  async bulkCreate(tenantId: string, warehouseId: string, dto: BulkCreateLocationsDto) {
    const expectedParentType = PARENT_TYPE[dto.type];
    const codeStyle = dto.codeStyle ?? LocationCodeStyle.NUMERIC;

    if (codeStyle === LocationCodeStyle.CUSTOM && !dto.customCodes?.length) {
      throw new BadRequestException('Indicá los códigos personalizados a usar');
    }
    if (codeStyle !== LocationCodeStyle.CUSTOM && !dto.count) {
      throw new BadRequestException('Indicá la cantidad a generar');
    }

    const pickCodes = (existingCodes: Set<string>): string[] => {
      if (codeStyle === LocationCodeStyle.CUSTOM) {
        const codes = dto.customCodes!.filter((c) => !existingCodes.has(c));
        codes.forEach((c) => existingCodes.add(c));
        return codes;
      }
      return generateFreeCodes(dto.count!, codeStyle, existingCodes);
    };

    let toInsert: NewLocation[];

    if (!expectedParentType) {
      if (dto.parentLocationId) {
        throw new BadRequestException('Un rack no puede tener padre');
      }
      const existingSiblings = await this.locationRepo.find({
        where: { tenantId, warehouseId, type: dto.type, parentLocationId: IsNull() },
      });
      const existingCodes = new Set(existingSiblings.map((l) => l.code));
      const codes = pickCodes(existingCodes);
      toInsert = codes.map((code) => ({
        tenantId,
        warehouseId,
        parentLocationId: null,
        type: dto.type,
        code,
        fullPath: code,
      }));
    } else {
      let parents: WarehouseLocation[];
      if (dto.applyToAllParents) {
        parents = await this.locationRepo.find({
          where: { tenantId, warehouseId, type: expectedParentType },
        });
        if (parents.length === 0) {
          throw new BadRequestException(
            `Todavía no hay ningún ${expectedParentType.toLowerCase()} donde generar ${dto.type.toLowerCase()}s`,
          );
        }
      } else {
        if (!dto.parentLocationId) {
          throw new BadRequestException(
            `Indicá un ${expectedParentType.toLowerCase()} padre o marcá "aplicar a todos"`,
          );
        }
        const parent = await this.locationRepo.findOne({
          where: { id: dto.parentLocationId, tenantId, warehouseId },
        });
        if (!parent || parent.type !== expectedParentType) {
          throw new BadRequestException(
            `El padre indicado debe ser de tipo ${expectedParentType}`,
          );
        }
        parents = [parent];
      }

      // One query for every parent's existing children instead of one query per parent.
      const allExisting = await this.locationRepo.find({
        where: { tenantId, warehouseId, parentLocationId: In(parents.map((p) => p.id)) },
      });
      const existingByParent = new Map<string, Set<string>>();
      for (const loc of allExisting) {
        const key = loc.parentLocationId!;
        if (!existingByParent.has(key)) existingByParent.set(key, new Set());
        existingByParent.get(key)!.add(loc.code);
      }

      toInsert = [];
      for (const parent of parents) {
        const existingCodes = existingByParent.get(parent.id) ?? new Set<string>();
        const codes = pickCodes(new Set(existingCodes));
        for (const code of codes) {
          toInsert.push({
            tenantId,
            warehouseId,
            parentLocationId: parent.id,
            type: dto.type,
            code,
            fullPath: `${parent.fullPath}-${code}`,
          });
        }
      }
    }

    if (toInsert.length === 0) return [];

    const result = await this.locationRepo.insert(toInsert);
    return toInsert.map((item, i) => ({
      ...item,
      id: result.identifiers[i].id as string,
      createdAt: result.generatedMaps[i]?.createdAt as Date,
    }));
  }

  findAll(tenantId: string, warehouseId: string) {
    return this.locationRepo.find({
      where: { tenantId, warehouseId },
      order: { fullPath: 'ASC' },
    });
  }

  // Renaming a node's code changes its own fullPath and, since fullPath is
  // denormalized, every descendant's fullPath needs the old prefix swapped
  // for the new one too (done in one raw UPDATE instead of walking the tree).
  async update(tenantId: string, warehouseId: string, id: string, dto: UpdateWarehouseLocationDto) {
    const location = await this.locationRepo.findOne({ where: { id, tenantId, warehouseId } });
    if (!location) throw new NotFoundException('Ubicación no encontrada');

    let parent: WarehouseLocation | null = null;
    if (location.parentLocationId) {
      parent = await this.locationRepo.findOne({ where: { id: location.parentLocationId } });
    }

    const siblingWhere = parent
      ? { tenantId, warehouseId, parentLocationId: parent.id }
      : { tenantId, warehouseId, parentLocationId: IsNull() };
    const siblings = await this.locationRepo.find({ where: { ...siblingWhere, type: location.type } });
    if (siblings.some((s) => s.id !== id && s.code === dto.code)) {
      throw new BadRequestException('Ya existe una ubicación con ese código en el mismo nivel');
    }

    const oldFullPath = location.fullPath;
    const newFullPath = parent ? `${parent.fullPath}-${dto.code}` : dto.code;

    location.code = dto.code;
    location.fullPath = newFullPath;
    await this.locationRepo.save(location);

    if (oldFullPath !== newFullPath) {
      await this.locationRepo.manager.query(
        `UPDATE warehouse_locations SET "fullPath" = $1 || substring("fullPath" from $2::int) WHERE "warehouseId" = $3 AND "fullPath" LIKE $4`,
        [newFullPath, oldFullPath.length + 1, warehouseId, `${oldFullPath}-%`],
      );
    }

    return location;
  }

  async remove(tenantId: string, warehouseId: string, id: string) {
    const location = await this.locationRepo.findOne({
      where: { id, tenantId, warehouseId },
    });
    if (!location) throw new NotFoundException('Ubicación no encontrada');
    await this.locationRepo.remove(location);
    return { id };
  }

  async clearAll(tenantId: string, warehouseId: string) {
    const result = await this.locationRepo.delete({ tenantId, warehouseId });
    return { deleted: result.affected ?? 0 };
  }
}
