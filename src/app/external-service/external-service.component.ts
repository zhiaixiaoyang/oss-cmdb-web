import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import {UserService} from '@trident/shared';
import { ExternalServiceService } from './external-service.service';

@Component ({
    selector: 'app-external-service',
    templateUrl: './external-service.component.html',
    styleUrls: ['./external-service.component.css']
})
export class ExternalServiceComponent implements OnInit, OnChanges {
  @ViewChild('NziFormComponent') NziFormComponent;
  constructor(private fb: FormBuilder,
              private externalServiceService: ExternalServiceService,
              private modalService: NzModalService,
              private userService: UserService,
              private nzMessageService: NzMessageService) {}

  data = [];
  loading = true;
  isPage = true;
  validateForm: FormGroup;
  environment;
  name ;
  isAdmin;
  tempData = [];
  userId = '';
  status;

  search(): void {
    if (null != this.environment && '' !== this.environment) {
      if ( null != this.name && '' !== this.name) {
        this.loading = true;
        this.externalServiceService.getAllExternalService(this.environment).subscribe(datas => {
          this.tempData = datas.items || [] ;
          const resultData = [];
          let remFlag = 0;
          if ('[]' === JSON.stringify(this.tempData)) {
            this.externalServiceService.getExternalIp(this.userId , this.environment).subscribe(data => {
              this.externalServiceService.create({externalip : data.externalip , environment : this.environment}).subscribe(
                result => {
                  this.externalServiceService.getAllExternalService(this.environment).subscribe(res => {
                    this.tempData = res.items || [] ;
                    this.data = [];
                    const esTemp = {};
                    for (const item of res.items) {
                      esTemp[item.metadata.name] = {name: item.metadata.name, externalip: item.metadata.labels.externalip};
                    }
                    for (const item in esTemp) {
                      this.externalServiceService.getExternalServiceByName(this.environment, esTemp[item].name)
                        .subscribe(rData => {
                          remFlag += 1;
                          for (const ele of rData.spec.services) {
                            if (undefined === this.status || null == this.status || '' === this.status || ele.status === this.status) {
                              let statusName = '';
                              if ('ALLOCATED' === ele.status) {
                                statusName = '已分配';
                              } else if ('UNALLOCATED' === ele.status) {
                                statusName = '未分配';
                              } else if ('LOCKED' === ele.status) {
                                statusName = '锁定';
                              }
                              if (null == this.name || '' === this.name || ele.port.indexOf(this.name) > -1) {
                                resultData.push({
                                  name: esTemp[item].name, externalip: esTemp[item].externalip, port: ele.port,
                                  servicename: ele.servicename, servicenamespace: ele.servicenamespace, targetport: ele.targetport,
                                  statusname: statusName, status: ele.status, user: ele.user, eip: ele.eip
                                });
                              }
                            }
                          }
                          if (remFlag === Object.keys(esTemp).length) {
                            this.data = resultData;
                            this.loading = false;
                          }
                        });
                    }
                  });
                });
            });
          } else {
            const esTemp = {};
            for (const item of datas.items) {
              esTemp[item.metadata.name] = {name: item.metadata.name, externalip: item.metadata.labels.externalip};
            }
            if ('{}' !== JSON.stringify(esTemp)) {
              for (const item in esTemp) {
                this.externalServiceService.getExternalServiceByName(this.environment, esTemp[item].name).subscribe(data => {
                  remFlag += 1;
                  for (const ele of data.spec.services) {
                    if (undefined === this.status || null === this.status || '' === this.status || ele.status === this.status) {
                      let statusName = '';
                      if ('ALLOCATED' === ele.status) {
                        statusName = '已分配';
                      } else if ('UNALLOCATED' === ele.status) {
                        statusName = '未分配';
                      } else if ('LOCKED' === ele.status) {
                        statusName = '锁定';
                      }
                      if (null == this.name || '' === this.name || ele.port.indexOf(this.name) > -1) {
                        resultData.push({
                          name: esTemp[item].name, externalip: esTemp[item].externalip, port: ele.port,
                          servicename: ele.servicename, servicenamespace: ele.servicenamespace, targetport: ele.targetport,
                          statusname: statusName, status: ele.status, user: ele.user, eip: ele.eip
                        });
                      }
                    }
                  }
                  if (remFlag === Object.keys(esTemp).length) {
                    this.data = resultData;
                    this.loading = false;
                  }
                });
              }
            } else {
              this.data = resultData;
              this.loading = false;
            }
          }
        });
      } else {
        this.getAllExternalService();
      }
    }
  }

  reloadDatas() {
    this.getAllExternalService();
    this.name = '';
    this.status = null;
  }

  getKeys(obj) {
    if (null === obj) {
      return false;
    }
    return Object.keys(obj);
  }

  getAllExternalService(): void {
    this.loading = true;
    this.externalServiceService.getAllExternalService(this.environment).subscribe(datas => {
      this.tempData = datas.items || [] ;
      const resultData = [];
      const esTemp = {};
      let remFlag = 0;
      if ('[]' === JSON.stringify(this.tempData)) {
        this.externalServiceService.getExternalIp(this.userId , this.environment).subscribe(data => {
          data.environment = this.environment;
          this.externalServiceService.create(data).subscribe(
            result => {
              this.externalServiceService.getAllExternalService(this.environment).subscribe(res => {
                this.tempData = res.items || [] ;
                for (const item of res.items) {
                  esTemp[item.metadata.name] = {name: item.metadata.name, externalip: item.metadata.labels.externalip};
                }
                for (const item in esTemp) {
                  this.externalServiceService.getExternalServiceByName(this.environment, esTemp[item].name).subscribe(rData => {
                    remFlag += 1;
                    for (const ele of rData.spec.services) {
                      if (undefined === this.status || null === this.status || '' === this.status || ele.status === this.status) {
                        let statusName = '';
                        if ('ALLOCATED' === ele.status) {
                          statusName = '已分配';
                        } else if ('UNALLOCATED' === ele.status) {
                          statusName = '未分配';
                        } else if ('LOCKED' === ele.status) {
                          statusName = '锁定';
                        }
                        resultData.push({
                          name: esTemp[item].name, externalip: esTemp[item].externalip, port: ele.port,
                          servicename: ele.servicename, servicenamespace: ele.servicenamespace, targetport: ele.targetport,
                          statusname: statusName, status: ele.status, user: ele.user, eip: ele.eip
                        });
                      }
                    }
                    if (remFlag === Object.keys(esTemp).length) {
                      this.data = resultData;
                      this.loading = false;
                    }
                  });
                }
              });
          });
        });
      } else {
        for (const item of datas.items) {
          esTemp[item.metadata.name] = {name: item.metadata.name, externalip: item.metadata.labels.externalip};
        }
        if ('{}' !== JSON.stringify(esTemp)) {
          for (const item in esTemp) {
            this.externalServiceService.getExternalServiceByName(this.environment, esTemp[item].name).subscribe(data => {
              remFlag += 1;
              for (const ele of data.spec.services) {
                if (undefined === this.status || null === this.status || '' === this.status || ele.status === this.status) {
                  let statusName = '';
                  if ('ALLOCATED' === ele.status) {
                    statusName = '已分配';
                  } else if ('UNALLOCATED' === ele.status) {
                    statusName = '未分配';
                  } else if ('LOCKED' === ele.status) {
                    statusName = '锁定';
                  }
                  resultData.push({
                    name: esTemp[item].name, externalip: esTemp[item].externalip, port: ele.port,
                    servicename: ele.servicename, servicenamespace: ele.servicenamespace, targetport: ele.targetport,
                    statusname: statusName, status: ele.status, user: ele.user, eip: ele.eip
                  });
                }
              }
              if (remFlag === Object.keys(esTemp).length) {
                this.data = resultData;
                this.loading = false;
              }
            });
          }
        } else {
          this.data = resultData;
          this.loading = false;
        }
      }
    });
  }

  changeEnvironment(): void {
    this.search();
  }

  getFormControl(name: string) {
    return this.validateForm.controls[name];
  }

  showConfirm(externalip) {
    this.modalService.confirm({
      nzTitle  : '你是否确认要删除这项Externalip池 ' + '[' + externalip +  ']',
      nzContent: '<b>删除操作无法回滚，请谨慎操作</b>',
      nzOnOk: () => {
        this.deleteExternalService(externalip);
      },
      nzOnCancel: () => {
      }
    });
  }

  updateExternalService(status , data , message) {
    data.status = status;
    data.environment = this.environment;
    const mid = this.nzMessageService.loading('正在执行' + message + '操作', {nzDuration: 0}).messageId;
    this.externalServiceService.edit(data).subscribe(res => {
      this.nzMessageService.success(message + '成功！');
      this.nzMessageService.remove(mid);
      this.search();
    });
  }

  deleteExternalService(externalip) {
    const mid = this.nzMessageService.loading('正在删除', {nzDuration: 0}).messageId;
    this.externalServiceService.deleteExternalService(externalip, this.environment).subscribe(res => {
      this.nzMessageService.success('删除成功！');
      this.nzMessageService.remove(mid);
      this.search();
    });
  }

  ngOnInit() {
    this.isAdmin = this.userService.isAdmin();
    this.userId = this.userService.getUserInfo().userName;
  }

  ngOnChanges() {

  }
}
