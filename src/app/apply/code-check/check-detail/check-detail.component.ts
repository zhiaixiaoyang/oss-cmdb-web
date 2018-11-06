import {Component, OnChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {CodeCheckService} from '../code-check.service';

@Component({
  selector: 'app-check-detail',
  templateUrl: './check-detail.component.html',
  styleUrls: ['./check-detail.component.css']
})
export class CheckDetailComponent implements OnInit, OnChanges {

  constructor(private codeCheckService: CodeCheckService,
              private activatedRoute: ActivatedRoute) {
  }

  loading = false;
  id;
  buildType;
  data = {
    'Id': '',
    'name': '',
    'sonarSources': '',
    'sonarResult': '',
    'pipelineName': '',
    'constructName': '',
    'createTime': '',
    'warrant': null
  };


  // 加载代码检查明细
  getCodeCheckById(id) {
    this.loading = true;
    this.codeCheckService.getDataById(id).subscribe(datas => {
      this.loading = false;
      this.data = datas;
    });
  }

  renovate() {
    this.getCodeCheckById(this.id);
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.getCodeCheckById(this.id);
  }

  ngOnChanges() {

  }
}
