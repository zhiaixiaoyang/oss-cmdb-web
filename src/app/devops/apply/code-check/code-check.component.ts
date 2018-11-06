import {Component, OnChanges, Output, EventEmitter, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';
import {CodeCheckService} from './code-check.service';
import {FormBuilder, FormControl, FormGroup, FormArray, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {NziModalService} from 'ng-zorro-iop';

@Component({
  selector: 'app-apply-code-check',
  templateUrl: './code-check.component.html',
  styleUrls: ['./code-check.component.css']
})
export class CodeCheckComponent implements OnInit, OnChanges, OnDestroy {
  @Output() del = new EventEmitter();
  @ViewChild('FormTagComponent') FormTagComponent;

  constructor(private codeCheckService: CodeCheckService,
              private modalService: NziModalService,
              private nzMessageService: NzMessageService,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute) {
  }

  data = []; // 表格数据
  loading; // 表格数据加载
  selectedValue = 'name'; // 选择搜索类别
  searchName; // 搜索内容
  dataSearch = []; // 搜索数据

  // 从本地数据库获取代码检查信息
  getData() {
    this.codeCheckService.getApps().subscribe(datas => {
      this.loading = false;
      if (datas) {
        this.data = datas;
        this.dataSearch = this.data;
        for (let i = 0; i < this.data.length; i++) {
          this.data[i].createTime = new Date(this.data[i].createTime);
        }
        if (this.searchName) {
          this.dataSearch = this.data;
          this.data = [];
          let eName;
          for (const element of this.dataSearch) {
            if (this.selectedValue === 'name') {
              eName = element.name;
            } else if (this.selectedValue === 'build') {
              eName = element.constructName;
            } else if (this.selectedValue === 'pipeline') {
              eName = element.pipelineName
            }
            if (eName.indexOf(this.searchName) > -1) {
              this.data.push(element);
            }
          }
        }
      }
    });
  }

  // 删除操作
  showConfirm(id, value) {
    const _this = this;
    this.modalService.confirm({
      nzTitle: '删除',
      nzContentTitle: '确定删除<em> “' +value+ '” </em>吗？',
      nzContent: '删除数据不可恢复与访问，请谨慎操作！',
      nzOkText: '确定',
      nzOnOk: () => {
        const isValid = _this.deleteForm(id);
        if (isValid) {
          _this.del.emit();
        }
      },
      nzOnCancel: () => {
      }
    });
  }

  // 删除数据
  deleteForm(id): void {
    const mid = this.nzMessageService.loading('正在删除中', {nzDuration: 0}).messageId;
    this.codeCheckService.delete(id).subscribe(respose => {
      //  this.refreshData(this.ownerId);
      this.nzMessageService.success('删除成功！');
      this.nzMessageService.remove(mid);
      this.getData();
    });
  }

  // 去掉首尾空格
  trim(str): string {
    return str.replace(/(^\s*)|(\s*$)/g, '');
  }

  // 模糊查询
  search(): void {
    this.loading = true;
    if (this.searchName == null || this.searchName === '') {
      this.data = this.dataSearch;
      this.loading = false;
    } else {
      this.searchName = this.trim(this.searchName);
      this.data = [];
      let eName;
      for (const element of this.dataSearch) {
        if (this.selectedValue === 'name') {
          eName = element.name;
        } else if (this.selectedValue === 'build') {
          eName = element.constructName;
        } else if (this.selectedValue === 'pipeline') {
          eName = element.pipelineName
        }
        if (eName.indexOf(this.searchName) > -1) {
          this.data.push(element);
        }
      }
      this.loading = false;
    }
  }

  // 重置搜索
  renovate(): void {
    this.searchName = '';
    this.data = this.dataSearch;
  }

  ngOnInit() {
    if (sessionStorage.getItem('searchCodeCheckName') &&
      sessionStorage.getItem('selectedCodeCheckValue') &&
      sessionStorage.getItem('searchCodeCheckName') !== 'undefined') {
      this.searchName = sessionStorage.getItem('searchCodeCheckName');
      this.selectedValue = sessionStorage.getItem('selectedCodeCheckValue');
      sessionStorage.removeItem('searchCodeCheckName');
      sessionStorage.removeItem('selectedCodeCheckValue');
    }
    this.getData();
  }

  ngOnDestroy() {
    sessionStorage.setItem('searchCodeCheckName', this.searchName); // 记录搜索框数据
    sessionStorage.setItem('selectedCodeCheckValue', this.selectedValue); // 记录搜索框当前选中
  }

  ngOnChanges() {
  }
}
