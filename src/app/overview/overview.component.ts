import {Component, OnChanges, OnInit, ViewChild, AfterViewInit, PipeTransform } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { OverviewService } from './overview.service';
import { DomSanitizer} from '@angular/platform-browser';
import { ApplicationParamService } from '../shared';

@Component ({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit, OnChanges , PipeTransform {

  data = [];
  loading = true;
  isPage = true;
  isVisible = false;
  allChecked = false;
  indeterminate = false;
  displayData = [];
  style = '1';
  display_name;
  isChange = false;
  validateForm: FormGroup;
  url;
//  port;
  memoryUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=40';
  memoryAllUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=44';
  memoryUsedUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=46';
  cpuUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=42';
  cpuAllUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=48';
  cpuUsedUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=50';
  systemUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=56';
  systemAllUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=52';
  systemUsedUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All&panelId=54';
  nodeCpuUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&panelId=70&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All';
  nodeMemoryUrl = '/d-solo/YmRqRPHik/iop-services?orgId=1&panelId=72&from=1530672726220&to=1530694326221&var-Node=All&var-Namespace=All';
  memory;
  memoryAll;
  memoryUsed;
  cpu;
  cpuAll;
  cpuUsed;
  system;
  systemAll;
  systemUsed;
  nodeCpu;
  nodeMemory;
  constructor(private fb: FormBuilder,
              private overviewService: OverviewService,
              private applicationParamService: ApplicationParamService,
              private modalService: NzModalService,
              private nzMessageService: NzMessageService,
              private sanitizer: DomSanitizer) {

    this.applicationParamService.getParams().then(datas => {
      if (datas && datas.cluster) {
//        this.port = datas.cluster.port;
//        this.url = datas.cluster.url + ':' + this.port;
        this.url = datas.cluster.url
        this.memory = this.transform(this.url + this.memoryUrl);
        this.memoryAll = this.transform(this.url + this.memoryAllUrl);
        this.memoryUsed = this.transform(this.url + this.memoryUsedUrl);
        this.cpu = this.transform(this.url + this.cpuUrl);
        this.cpuAll = this.transform(this.url + this.cpuAllUrl);
        this.cpuUsed = this.transform(this.url + this.cpuUsedUrl);
        this.system = this.transform(this.url + this.systemUrl);
        this.systemAll  = this.transform(this.url + this.systemAllUrl );
        this.systemUsed = this.transform(this.url + this.systemUsedUrl);
        this.nodeCpu = this.transform(this.url + this.nodeCpuUrl);
        this.nodeMemory = this.transform(this.url + this.nodeMemoryUrl);
      }
    });
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngAfterViewInit() {
    // let bodyEle = document.getElementsByTagName('body')[0];
    // bodyEle.addEventListener('onload', function() {
    //   let panels = document.getElementsByClassName('panels');
    //   for (let i = 0; i < panels.length; i++ ) {
    //     panels[i].removeAttribute('class');
    //   }
    // });
  }

  setIframeStyle(obj) {

    // document.getElementById('memoryIfream').style.height = '250px';
    // let panels = document.getElementsByClassName('panels');
    // for (let i = 0; i < panels.length; i++ ) {
    //   panels[i].removeAttribute('class');
    // }
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }
}
