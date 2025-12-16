import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto, UpdateCertificationDto } from './dto/certification.dto';

@ApiTags('certifications')
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get certifications statistics' })
  @ApiResponse({ status: 200, description: 'Returns certifications statistics' })
  getStats() {
    return this.certificationsService.getStats();
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all certifications for admin (including inactive)' })
  @ApiResponse({ status: 200, description: 'Returns all certifications' })
  findAllForAdmin() {
    return this.certificationsService.findAllForAdmin();
  }

  @Get()
  @ApiOperation({ summary: 'Get all certifications' })
  @ApiQuery({ name: 'issuer', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns all certifications' })
  findAll(@Query('issuer') issuer?: string) {
    if (issuer) {
      return this.certificationsService.findByIssuer(issuer);
    }
    return this.certificationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certification by ID' })
  @ApiResponse({ status: 200, description: 'Returns the certification' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  findOne(@Param('id') id: string) {
    return this.certificationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new certification' })
  @ApiResponse({ status: 201, description: 'Certification created successfully' })
  create(@Body() createCertificationDto: CreateCertificationDto) {
    return this.certificationsService.create(createCertificationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a certification' })
  @ApiResponse({ status: 200, description: 'Certification updated successfully' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  update(@Param('id') id: string, @Body() updateCertificationDto: UpdateCertificationDto) {
    return this.certificationsService.update(id, updateCertificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a certification' })
  @ApiResponse({ status: 200, description: 'Certification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  remove(@Param('id') id: string) {
    return this.certificationsService.remove(id);
  }
}
