import {LogitPage} from './app.po';
import { element, by } from 'protractor';

describe('logit App', () => {
  let page: LogitPage;

  beforeEach(() => {
    page = new LogitPage();
  });

  it('should display message saying App works !', () => {
    page.navigateTo('/');
    expect(element(by.css('app-home h1')).getText()).toMatch('App works !');
  });
});
