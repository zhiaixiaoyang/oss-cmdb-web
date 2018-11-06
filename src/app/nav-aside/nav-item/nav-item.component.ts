import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.css']
})
export class NavItemComponent{
  @Input() sideList: any;
  @Output() openChange = new EventEmitter();

  openChange1() {
    this.openChange.emit();
  }
}
