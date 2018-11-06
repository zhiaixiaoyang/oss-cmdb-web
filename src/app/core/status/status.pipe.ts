import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'statusReform'})
export class StatusReform implements PipeTransform {
  transform(val, type): string {
    let handlerCore = function(status, label, cssClass) {
      status = status || 'unknown';
      label = label || "未知";
      cssClass = cssClass || "label-status";
      return {status: status, label: label, cssClass: cssClass.join(" ")};
    };

    let statusHandler = {
      'default': function(status) {
        return handlerCore(status, status, ["label-status"]);
      },
      'deploy': function(status) {
        let label, cssClass = ["label-status"];
        switch (status) {
          case 'ready':
            label = "就绪";
            cssClass.push("label-status-success");
            break;
          case  'warning':
              label = "警告";
              cssClass.push("label-status-warning");
              break;
          default:
            label = status;
            break;
        }
        return handlerCore(status, label, cssClass);
      }
    };

    if (typeof statusHandler[type] !== "function") {
      type = "default";
    }
    let statusObj = statusHandler[type].call(statusHandler[type], val);

    return '<label class="'+statusObj.cssClass+'" data-status="'+statusObj.status+'">'+statusObj.label+'</label>';
  }
}
