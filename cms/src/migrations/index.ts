import * as migration_20261001_060628_baev_initial_schema from './20261001_060628_baev_initial_schema';
import * as migration_20261001_065757_baev_editorial_workflow from './20261001_065757_baev_editorial_workflow';
import * as migration_20261001_071316_baev_templates_and_workflow_v2 from './20261001_071316_baev_templates_and_workflow_v2';
import * as migration_20261004_124623_baev_visual_blog from './20261004_124623_baev_visual_blog';
import * as migration_20261004_133854_baev_quiet_builder from './20261004_133854_baev_quiet_builder';
import * as migration_20261004_142135_baev_block_spacing from './20261004_142135_baev_block_spacing';
import * as migration_20261004_180631_baev_external_case from './20261004_180631_baev_external_case';

export const migrations = [
  {
    up: migration_20261001_060628_baev_initial_schema.up,
    down: migration_20261001_060628_baev_initial_schema.down,
    name: '20261001_060628_baev_initial_schema',
  },
  {
    up: migration_20261001_065757_baev_editorial_workflow.up,
    down: migration_20261001_065757_baev_editorial_workflow.down,
    name: '20261001_065757_baev_editorial_workflow',
  },
  {
    up: migration_20261001_071316_baev_templates_and_workflow_v2.up,
    down: migration_20261001_071316_baev_templates_and_workflow_v2.down,
    name: '20261001_071316_baev_templates_and_workflow_v2',
  },
  {
    up: migration_20261004_124623_baev_visual_blog.up,
    down: migration_20261004_124623_baev_visual_blog.down,
    name: '20261004_124623_baev_visual_blog',
  },
  {
    up: migration_20261004_133854_baev_quiet_builder.up,
    down: migration_20261004_133854_baev_quiet_builder.down,
    name: '20261004_133854_baev_quiet_builder',
  },
  {
    up: migration_20261004_142135_baev_block_spacing.up,
    down: migration_20261004_142135_baev_block_spacing.down,
    name: '20261004_142135_baev_block_spacing',
  },
  {
    up: migration_20261004_180631_baev_external_case.up,
    down: migration_20261004_180631_baev_external_case.down,
    name: '20261004_180631_baev_external_case'
  },
];
