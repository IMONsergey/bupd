import * as migration_20261001_060628_baev_initial_schema from './20261001_060628_baev_initial_schema';
import * as migration_20261001_065757_baev_editorial_workflow from './20261001_065757_baev_editorial_workflow';
import * as migration_20261001_071316_baev_templates_and_workflow_v2 from './20261001_071316_baev_templates_and_workflow_v2';

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
    name: '20261001_071316_baev_templates_and_workflow_v2'
  },
];
