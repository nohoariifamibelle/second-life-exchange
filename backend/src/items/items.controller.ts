import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ParseMongoIdPipe } from '../common';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * POST /items - Crée un nouvel objet
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createItemDto: CreateItemDto, @Request() req) {
    const item = await this.itemsService.create(createItemDto, req.user.userId);
    return this.formatItemResponse(item);
  }

  /**
   * GET /items - Liste tous les objets disponibles (public)
   */
  @Public()
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('condition') condition?: string,
    @Query('city') city?: string,
    @Query('postalCode') postalCode?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.itemsService.findAll({
      category,
      condition,
      city,
      postalCode,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });

    return {
      items: result.items.map((item) => this.formatItemResponse(item)),
      pagination: result.pagination,
    };
  }

  /**
   * GET /items/my - Liste les objets de l'utilisateur connecté
   */
  @Get('my')
  async findMyItems(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.itemsService.findByOwner(
      req.user.userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 12,
    );

    return {
      items: result.items.map((item) => this.formatItemResponse(item)),
      pagination: result.pagination,
    };
  }

  /**
   * GET /items/count - Compte les objets de l'utilisateur connecté
   */
  @Get('count')
  async countMyItems(@Request() req) {
    const count = await this.itemsService.countByOwner(req.user.userId);
    return { count };
  }

  /**
   * GET /items/:id - Récupère un objet par son ID (public)
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const item = await this.itemsService.findOneAndIncrementViews(id);
    return this.formatItemResponse(item);
  }

  /**
   * PATCH /items/:id - Met à jour un objet
   */
  @Patch(':id')
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    const item = await this.itemsService.update(
      id,
      updateItemDto,
      req.user.userId,
    );
    return this.formatItemResponse(item);
  }

  /**
   * DELETE /items/:id - Supprime un objet
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseMongoIdPipe) id: string, @Request() req) {
    await this.itemsService.remove(id, req.user.userId);
    return { message: 'Objet supprimé avec succès' };
  }

  /**
   * Formate la réponse d'un objet
   */
  private formatItemResponse(item: any) {
    const itemObj = item.toObject ? item.toObject() : item;

    const response: any = {
      id: itemObj._id.toString(),
      title: itemObj.title,
      description: itemObj.description,
      category: itemObj.category,
      condition: itemObj.condition,
      images: itemObj.images || [],
      city: itemObj.city,
      postalCode: itemObj.postalCode,
      status: itemObj.status,
      viewCount: itemObj.viewCount || 0,
      createdAt: itemObj.createdAt,
      updatedAt: itemObj.updatedAt,
    };

    // Si owner est peuplé (objet avec propriétés) vs juste un ObjectId
    if (
      itemObj.owner &&
      typeof itemObj.owner === 'object' &&
      'firstName' in itemObj.owner
    ) {
      response.owner = {
        id: (itemObj.owner._id || itemObj.owner.id || '').toString(),
        firstName: itemObj.owner.firstName || '',
        lastName: itemObj.owner.lastName || '',
        city: itemObj.owner.city || '',
        avatar: itemObj.owner.avatar || '',
      };
    } else if (itemObj.owner) {
      // Owner non peuplé, juste l'ID
      response.ownerId = itemObj.owner.toString();
    }

    return response;
  }
}
