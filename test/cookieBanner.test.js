'use strict';

/* eslint-env jest, browser */

const fs = require('fs');
const path = require('path');
const cookieSettings = require('../client-js/cookieSettings');

describe('ga-tag', () => {

  let GOVUK;

  beforeEach(() => {
    GOVUK = { cookie: jest.fn() };
    global.GOVUK = GOVUK;
    GOVUK.cookie.mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cookie banner', () => {

    let bannerContainer;

    beforeEach(() => {
      bannerContainer = document.createElement('div');
      bannerContainer.id = 'global-cookie-message';
      bannerContainer.innerHTML = fs.readFileSync(path.join(__dirname, '../node_modules/hof-template-partials/views/partials/cookie-banner.html'), 'utf8');
      document.body.appendChild(bannerContainer);
    });

    afterEach(() => {
      document.body.removeChild(bannerContainer);
    });

    test('it should not alter banner display style if cookie preferences are already set', () => {
      GOVUK.cookie.mockReturnValueOnce('{"essential":true,"usage":true}');
      cookieSettings.initialiseCookieBanner();
      expect(bannerContainer.style.display).toEqual('');
    });

    test('it should show banner container if container and banner are both present', () => {
      cookieSettings.initialiseCookieBanner();
      expect(bannerContainer.style.display).toEqual('block');
    });

    test('it should hide fallback content if JS is enabled', () => {
      cookieSettings.initialiseCookieBanner();
      const fallbackContent = document.getElementsByClassName('js-disabled');
      for (let element of fallbackContent) {
        expect(element.style.display).toEqual('none');
      }
    });

    test('it should show interactive content if JS is enabled', () => {
      cookieSettings.initialiseCookieBanner();
      const interactiveContent = document.getElementsByClassName('js-enabled');
      for (let element of interactiveContent) {
        expect(element.style.display).toEqual('block');
      }
    });

    describe('cookie banner buttons', () => {

      test('it should set usage true on clicking `yes` button', () => {
        cookieSettings.initialiseCookieBanner();
        let expected = '{"essential":true,"usage":true}';
        document.getElementById('accept-cookies-button').click();
        expect(GOVUK.cookie).toHaveBeenNthCalledWith(2, 'cookie_preferences', expected, { days: 30 });
      });

      test('it should set usage false on clicking `no` button', () => {
        cookieSettings.initialiseCookieBanner();
        let expected = '{"essential":true,"usage":false}';
        document.getElementById('reject-cookies-button').click();
        expect(GOVUK.cookie).toHaveBeenNthCalledWith(2, 'cookie_preferences', expected, { days: 30 });
      });

    });

  });

  describe('cookie page', () => {

    let cookieSettingsContainer;

    beforeEach(() => {
      cookieSettingsContainer = document.createElement('div');
      cookieSettingsContainer.id = 'cookie-settings';

      let jsEnabled = document.createElement('div');
      jsEnabled.classList.add('js-enabled');

      let radioButtons = document.createElement('div');
      jsEnabled.appendChild(radioButtons);
      radioButtons.outerHTML = fs.readFileSync(path.join(__dirname, '../node_modules/hof-template-partials/views/partials/cookie-settings-radio.html'), 'utf8');

      let submitButton = document.createElement('div');
      jsEnabled.appendChild(submitButton);
      submitButton.outerHTML = fs.readFileSync(path.join(__dirname, '../node_modules/hof-template-partials/views/partials/cookie-settings-button.html'), 'utf8');

      let jsDisabled = document.createElement('div');
      jsDisabled.classList.add('js-disabled');

      document.body.appendChild(cookieSettingsContainer);
      cookieSettingsContainer.appendChild(jsEnabled);
      cookieSettingsContainer.appendChild(jsDisabled);
    });

    afterEach(() => {
      document.body.removeChild(cookieSettingsContainer);
    });

    test('it should hide fallback content if JS is enabled', () => {
      cookieSettings.initialiseCookiePage();
      const fallbackContent = document.getElementsByClassName('js-disabled');
      for (let element of fallbackContent) {
        expect(element.style.display).toEqual('none');
      }
    });

    test('it should show interactive content if JS is enabled', () => {
      cookieSettings.initialiseCookiePage();
      const interactiveContent = document.getElementsByClassName('js-enabled');
      for (let element of interactiveContent) {
        expect(element.style.display).toEqual('block');
      }
    });

    describe('cookie page form controls', () => {

      test('it should set first radio button checked if usage is true', () => {
        GOVUK.cookie.mockReturnValueOnce('{"usage": true}');
        cookieSettings.initialiseCookiePage();
        expect(document.getElementById('radio-1').checked).toEqual(true);
        expect(document.getElementById('radio-2').checked).toEqual(false);
      });

      test('it should set first radio button checked if usage is not defined', () => {
        GOVUK.cookie.mockReturnValueOnce('{}');
        cookieSettings.initialiseCookiePage();
        expect(document.getElementById('radio-1').checked).toEqual(true);
        expect(document.getElementById('radio-2').checked).toEqual(false);
      });

      test('it should set first radio button checked if preferences is unset', () => {
        GOVUK.cookie.mockReturnValueOnce(null);
        cookieSettings.initialiseCookiePage();
        expect(document.getElementById('radio-1').checked).toEqual(true);
        expect(document.getElementById('radio-2').checked).toEqual(false);
      });

      test('it should set second radio button checked if usage is false', () => {
        GOVUK.cookie.mockReturnValueOnce('{"usage": false}');
        cookieSettings.initialiseCookiePage();
        expect(document.getElementById('radio-1').checked).toEqual(false);
        expect(document.getElementById('radio-2').checked).toEqual(true);
      });

      test('it should set usage true on submit with first radio button checked', () => {
        cookieSettings.initialiseCookiePage();
        let expected = '{"essential":true,"usage":true}';
        document.getElementById('radio-1').click();
        document.getElementById('save-cookie-settings').click();
        expect(GOVUK.cookie).toHaveBeenNthCalledWith(2, 'cookie_preferences', expected, { days: 30 });
      });

      test('it should set usage false on submit with second radio button checked', () => {
        cookieSettings.initialiseCookiePage();
        let expected = '{"essential":true,"usage":false}';
        document.getElementById('radio-2').click();
        document.getElementById('save-cookie-settings').click();
        expect(GOVUK.cookie).toHaveBeenNthCalledWith(2, 'cookie_preferences', expected, { days: 30 });
      });

    });

  });

});
