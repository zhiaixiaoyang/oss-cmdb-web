import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { MenuService } from '../shared';

@Component({
  selector: 'app-nav-aside',
  templateUrl: './nav-aside.component.html',
  styleUrls: ['./nav-aside.component.css']
})
export class NavAsideComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('ul') ul: any;

  constructor(private router: Router,
              private menuService: MenuService) {
  }

  subscription: Subscription
  disabled;

  sideObject = {};
  sideLists: any[] = [];
  label = '';
  icon = '';

  adminSideLists: any[] = [
  ];

  openChange(sideList) {
    for (const i in this.sideLists) {
      if (this.sideLists[i] !== sideList) {
        this.sideLists[i].open = false;
      }
    }
  }

  openChange1(sideList) {
    for (const i in this.adminSideLists) {
      if (this.adminSideLists[i] !== sideList) {
        this.adminSideLists[i].open = false;
      }
    }
  }

  selectSide(url) {
    this.sideLists = [];
    let paths = url.split("?")[0].split('/'), path1;
    let urls = [];
    for (let i = 1; i < paths.length; i++) {
      let path = '';
      for (let j = 1; j <= i; j++) {
        path += paths[j] + '/'
      }
      urls.push(path.slice(0, -1));
    }
    for (let key in this.sideObject) {
      let item = this.sideObject[key];
      for (let list of item.sideLists) {
        if (urls.indexOf(list.link) > -1) {
          list.selected = true;
          this.sideLists = item.sideLists;
          this.label = item.label;
          this.icon = item.icon;
        } else {
          list.selected = false;
        }
        if (list.children) {
          let flag = false;
          for (let m of list.children) {
            if (urls.indexOf(m.link) > -1) {
              m.selected = true;
              flag = true;
              this.sideLists = item.sideLists;
              this.label = item.label;
              this.icon = item.icon;
            } else {
              m.selected = false;
            }
          }
          list.open = flag
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.subscription = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        this.selectSide(event.url);
      });
  }

  ngOnInit(): void {
    this.menuService.getMenu().subscribe(res => {
      this.sideObject = res;
      let urls = window.location.href.split('#'),
        url = urls[1] || '';
      this.selectSide(url);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
