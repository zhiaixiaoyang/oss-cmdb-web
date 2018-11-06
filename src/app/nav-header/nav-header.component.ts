import { Component, Input, OnInit, AfterViewInit, DoCheck, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

import { UserService, ApplicationParamService, MenuService } from '../shared';

@Component({
  selector: 'app-nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.css']
})
export class NavHeaderComponent implements OnInit, DoCheck, AfterViewInit, OnDestroy {
  @Input() classStyle: any;
  @Input() mainHeight;
  userName: String;
  isSpinning = true;
  accountUrl = '';
  passwordUrl = '';
  logoutUrl = '';
  logoUrl = '';
  visible = false;
  visibleHelp = false;
  helpHeight = 0;
  style = {
    backgroundColor: '#35b2de'
  };
  constructor (private userService: UserService,
               private appParam: ApplicationParamService,
               private menuService: MenuService,
               private router: Router) {}

  subscription: Subscription
  tabBarStyle= {
    "padding-top": "18px",
    "width": "150px",
    "background-color": "#333a42",
    "border": "none",
    "color": "#ababab"
  }

  sideObject = {}
  sideLists = [];
  searchData(val) {
    console.log(val);
  }

  getAppParam() {
    this.appParam.getParams().then(datas => {
      this.isSpinning = false;
      if (datas && datas.auth) {
        this.accountUrl = `${datas.auth.url}/realms/${datas.auth.realm}/account`;
        this.passwordUrl = `${datas.auth.url}/realms/${datas.auth.realm}/account/password`;
        this.logoutUrl = `${datas.auth.url}/realms/${datas.auth.realm}/protocol/openid-connect/logout?redirect_uri=${datas.auth.redirectUri}`;
      }
      this.logoUrl = datas.logo.url;
    });
  }

  aside;
  sideItems;
  hoverFunction(e) {
    let className = e.currentTarget.className;
    if (className.indexOf("ant-tabs-tab-active") < 0) {
      e.currentTarget.click();
    }
  }
  dropdownChange($event) {
    if($event) {
      setTimeout(() => {
        this.aside = document.getElementById("dropdown-aside");
        this.sideItems = this.aside.getElementsByClassName("ant-tabs-tab");
        for (let item of this.sideItems) {
          item.addEventListener('mouseover', this.hoverFunction, true);
        }
      }, 100);
    } else {
      for (let item of this.sideItems) {
        item.removeEventListener('mouseover', this.hoverFunction, true);
      }
    }
  }

  hideDropdown() {
    this.visible = false;
  }

  hideHelp() {
    this.visibleHelp = false;
  }

  selectMenu(url) {
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
      let item = this.sideObject[key], flag = true;
      for (let list of item.sideLists) {
        if (flag) {
          item.selected = urls.indexOf(list.link) > -1 ? true : false;
          flag = !item.selected;
          if (list.children) {
            for (let m of list.children) {
              if (flag) {
                item.selected = urls.indexOf(m.link) > -1 ? true : false;
                flag = !item.selected;
              }
            }
          }
        }
      }
    }
    let lists = [];
    for (let key in this.sideObject) {
      let obj = {
        "label": this.sideObject[key].label,
        "link": this.sideObject[key].link,
        "selected": this.sideObject[key].selected
      }
      lists.push(obj);
    }
    this.sideLists = lists;
  }

  ngOnInit() {
    this.userName = this.userService.getUserInfo().userName;
    this.getAppParam();
    this.helpHeight = this.mainHeight;
    this.menuService.getMenu().subscribe(res => {
      this.sideObject = res;
      let lists = [];
      for (let key in this.sideObject) {
        let obj = {
          "label": this.sideObject[key].label,
          "link": this.sideObject[key].link,
          "selected": this.sideObject[key].selected
        }
        lists.push(obj);
      }
      this.sideLists = lists;
      let urls = window.location.href.split('#'),
        url = urls[1] || '';
      this.selectMenu(url);
    });
  }

  ngAfterViewInit() {
    this.subscription = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        this.selectMenu(event.url);
      });
  }

  ngDoCheck() {
    this.helpHeight = this.mainHeight;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
