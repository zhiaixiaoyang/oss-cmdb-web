import {Component, OnChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {BuildManagementService} from '../build-management.service';

@Component({
  selector: 'app-build-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class BuildDetailComponent implements OnInit, OnChanges {

  constructor(private buildManagementService: BuildManagementService,
              private activatedRoute: ActivatedRoute) {
  }

  loading = false;
  id;
  buildType;
  data = {
    'Id': '',
    'name': '',
    'scmType': '',
    'projectUrl': '',
    'branchName': '',
    'scmUsername': '',
    'scmPassword': '',
    'language': '',
    'buildTool': '',
    'buildScript': '',
    'triggerGitevent': '',
    'triggerPoll': '',
    'triggerManual': '',
    'artifactName': '',
    'artifactPath': '',
    'baseImage': '',
    'outputImageName': '',
    'registry': '',
    'registryUsername': '',
    'registryPassword': '',
    'cmdOpts': '',
    'namespace': '',
    'buildType': '',
    'pkgName': '',
    'pkgVersion': '',
    'createTime': null,
    'exposePort': '',
    'lastBuildTime': null,
    'warrant': null
  };
  checkOptions = [
    'Push Events',
    'Opened Merge Request Events',
    'Accepted Merge Request Events',
    'Closed Merge Request Event',
    'Comments'
  ];
  triggerGitevent = [];

  // 加载构建明细
  getBuildManagementById(id) {
    this.loading = true;
    this.buildManagementService.getAppsById(id).subscribe(datas => {
      this.loading = false;
      this.data = datas;
      //  this.data.triggerGitevent = '';
      if (datas.triggerGitevent !== '00000') {
        for (let i = 0; i < datas.triggerGitevent.length; i++) {
          if (datas.triggerGitevent.slice(i, i + 1) === '1') {
            this.triggerGitevent.push({'git': this.checkOptions[i]});
          }
        }
        this.data.triggerGitevent = this.data.triggerGitevent.slice(5, this.data.triggerGitevent.length);
      }
      this.buildType = this.data.buildType;
      // 处理构建类型
      if (this.data.buildType === 'b2i') {
        this.data.buildType = '从程序包构建镜像';
      } else if (this.data.buildType === 's2i') {
        this.data.buildType = '从源代码构建镜像';
      } else if (this.data.buildType === 's2b') {
        this.data.buildType = '从源代码构建程序包';
      }
      // 处理构建时间
      this.data.lastBuildTime = new Date(this.data.lastBuildTime);
    });
  }

  renovate() {
    this.getBuildManagementById(this.id);
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.getBuildManagementById(this.id);
  }

  ngOnChanges() {

  }
}
