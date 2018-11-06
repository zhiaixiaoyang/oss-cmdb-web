import { Component, OnInit } from '@angular/core';
import { Pipeline } from './data-pipeline';
import { Structure } from './data-structure';

@Component({
  selector: 'app-table-statistics',
  templateUrl: './table-statistics.component.html',
  styleUrls: ['./table-statistics.component.scss']
})
export class TableStatisticsComponent implements OnInit {
  pipeline = {
    info: {
      IN_PROGRESS: null,
      ERROR: null,
      IN_MANPOWER: null
    },
    data: [
      /*{
        key: '1',
        name: 'pipeline-1',
        date: '2018-07-03 12:00',
        status: 'IN_PROGRESS'
      },
      {
        key: '2',
        name: 'pipeline-2',
        date: '2018-07-02 12:00',
        status: 'IN_MANPOWER'
      },
      {
        key: '3',
        name: 'pipeline-3',
        date: '2018-07-01 12:00',
        status: 'ERROR'
      },
      {
        key: '4',
        name: 'pipeline-4',
        date: '2018-07-01 12:00',
        status: 'IN_MANPOWER'
      },
      {
        key: '4',
        name: 'pipeline-5',
        date: '2018-06-01 12:00',
        status: 'IN_PROGRESS'
      }*/]
  };
  structure = {
    info: [{
      name: '构建个数',
      num: null
    }, {
      name: '构建次数',
      num: null
    }],
    data: [
      /*{
        key: '1',
        name: 'pipeline-1',
        class: 'GitLab',
        project: 'master',
        event: 'gitevent'
      },
      {
        key: '2',
        name: 'pipeline-2',
        class: 'GitLab',
        project: 'master',
        event: 'gitevent'
      },
      {
        key: '3',
        name: 'pipeline-3',
        class: 'GitLab',
        project: 'master',
        event: 'gitevent'
      },
      {
        key: '4',
        name: 'pipeline-4',
        class: 'GitLab',
        project: 'master',
        event: 'gitevent'
      },
      {
        key: '4',
        name: 'pipeline-5',
        class: 'GitLab',
        project: 'master',
        event: 'gitevent'
      }*/]
  };

  get pipelineData(): Array<Pipeline> {
    return this.pipeline.data;
  }
  get structureData(): Array<Structure> {
    return this.structure.data;
  }

  constructor() { }
  ngOnInit() {

  }

}
