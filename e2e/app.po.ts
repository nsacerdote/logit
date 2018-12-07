import { browser } from 'protractor';

/* tslint:disable */
export class LogitPage {
  navigateTo(route: string) {
    return browser.get(route);
  }
}
