/**
 * SISTEMA: PGLP | MONTE HERMOM
 * MÓDULO: AppModule (Root)
 * VERSÃO: 4.3.1
 * DATA: 19/02/2026
 * OBJETIVO:
 * - Registrar Controllers
 * - Registrar Orquestradores (Use Cases)
 * - Registrar Repositórios concretos
 */

import { Module } from '@nestjs/common';

// ===== CONTROLLERS =====
import { HealthController } from './infrastructure/http/health.controller';
import { LaudosController } from './infrastructure/http/laudos.controller';
import { AssinaturasController } from './infrastructure/http/assinaturas.controller';

// ===== ORQUESTRADORES (Application) =====
import { OrquestradorAberturaLaudo } from './application/laudo/OrquestradorAberturaLaudo';
import { AtualizarDadosLaudo } from './application/laudo/AtualizarDadosLaudo';
import { AssinarLaudo } from './application/assinatura/AssinarLaudo';

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ✅ NOVO USE CASE DE CÁLCULO
import { ExecutarCalculoNormativo } from './application/calculo/ExecutarCalculoNormativo';
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ===== REPOSITÓRIOS (Infrastructure) =====
import { LaudoRepositoryMySQL } from './infrastructure/persistence/laudo.repository.mysql';
import { AuditoriaRepositoryMySQL } from './infrastructure/persistence/auditoria.repository.mysql';

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ✅ IMPLEMENTAÇÃO TEMPORÁRIA DO CÁLCULO
import { CalculoRepositoryMemory } from './core/calculo/CalculoRepositoryMemory';
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ===== CONTRATOS (Application) =====
import { LaudoRepository } from './application/laudo/LaudoPersistenceService';
import { AuditoriaRepository } from './application/auditoria/AuditoriaRepository';

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ✅ CONTRATO DO REPOSITÓRIO DE CÁLCULO
import { CalculoRepository } from './core/calculo/CalculoRepository';
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ✅ ENGINE NORMATIVO
import { CalculoPGLP } from './core/calculo/CalculoPGLP';
import { TemplateRepository } from './core/templates/TemplateRepository';
import { loadTemplatesFromSeed } from './core/templates/loadTemplatesFromSeed';
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

@Module({
  controllers: [
    HealthController,
    LaudosController,
    AssinaturasController,
  ],

  providers: [
    // ===== ORQUESTRADORES EXISTENTES =====
    OrquestradorAberturaLaudo,
    AtualizarDadosLaudo,
    AssinarLaudo,

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // ✅ USE CASE DE CÁLCULO
    ExecutarCalculoNormativo,
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // ===== REPOSITÓRIOS (bind contrato → implementação) =====
    {
      provide: LaudoRepository,
      useClass: LaudoRepositoryMySQL,
    },
    {
      provide: AuditoriaRepository,
      useClass: AuditoriaRepositoryMySQL,
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // ✅ REPOSITÓRIO DE CÁLCULO (TEMPORÁRIO EM MEMÓRIA)
    {
      provide: CalculoRepository,
      useClass: CalculoRepositoryMemory,
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // ✅ ENGINE DE CÁLCULO (PROVIDER EXPLÍCITO)
    {
      provide: CalculoPGLP,
      useFactory: () => {
        const templateRepo = new TemplateRepository();

        // carrega templates oficiais
        loadTemplatesFromSeed(
          templateRepo,
          './seed/templates_oficiais.json'
        );

        return new CalculoPGLP(templateRepo);
      },
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ],
})
export class AppModule {}