import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';

import { BinariesService } from '../binaries.service';

@Component({
  selector: 'app-binaries-table',
  styleUrls: ['./binaries-table.component.css'],
  templateUrl: './binaries-table.component.html',
})
export class BinariesTableComponent implements OnInit {
  constructor(private modalService: NzModalService,
              private binariesService: BinariesService,
              private message: NzMessageService) {}
  binariesList = [];
  loading = true;
  search = '';


  getBinariesList(name: string, runtimeEnv: string): void {
    this.loading = true;
    this.binariesService.getBinariesList(name, runtimeEnv).subscribe({
      next: (datas) => {
      this.binariesList = datas || [];
    },
    complete: () => {
      this.loading = false;
    }
    });
  }


  refreshTabale() {
    this.getBinariesList(this.search, '');
  }

  searchData(): void {
    this.getBinariesList(this.search, '');
  }

  delBinaries(item): void {
    const mid = this.message.loading('正在删除中', {nzDuration: 0}).messageId;
    this.binariesService.delBinaries(item.id).subscribe(respose =>  {
      this.message.success('删除成功！');
      this.message.remove(mid);
      this.refreshTabale();
    });
  }

  delBinariesVersion(item): void {
    const mid = this.message.loading('正在删除中', {nzDuration: 0}).messageId;
    this.binariesService.delBinariesVersion(item.id).subscribe(respose =>  {
      this.message.success('删除成功！');
      this.message.remove(mid);
      this.refreshTabale();
    });
  }

  updateBinariesVersion(): void {
    this.refreshTabale();
  }

  ngOnInit() {
    this.getBinariesList('', '');
  }
}
