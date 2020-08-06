/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */
import chai, {expect} from 'chai';

import HtmlReady from './HtmlReady';

describe('htmlready', () => {
  before(() => {
    global.$STM_Config = {};
  });

  it('should return plain text without html unmolested', () => {
    const teststring = 'teststring lol';
    expect(HtmlReady(teststring).html).to.equal(teststring);
  });

  it('should allow links where the text portion and href contains smoke.io', () => {
    const dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://smoke.io/signup" xmlns="http://www.w3.org/1999/xhtml">https://smoke.io/signup</a></xml>';
    const res = HtmlReady(dirty).html;
    expect(res).to.equal(dirty);
  });

  it('should not omit text on same line as youtube link', () => {
      const testString =
          '<html><p>before text https://www.youtube.com/watch?v=NrS9vvNgx7I after text</p></html>';
      const htmlified =
          '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:NrS9vvNgx7I youtube ~~~ after text</p></html>';
      const res = HtmlReady(testString).html;
      expect(res).toEqual(htmlified);
  });

  it('should not omit text on same line as vimeo link', () => {
      const testString =
          '<html><p>before text https://vimeo.com/193628816/ after text</p></html>';
      const htmlified =
          '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:193628816 vimeo ~~~ after text</p></html>';
      const res = HtmlReady(testString).html;
      expect(res).toEqual(htmlified);
  });

  it('should not omit text on same line as dtube link', () => {
      const testString =
          '<html><p>before text https://d.tube/#!/v/tibfox/mvh7g26e after text</p></html>';
      const htmlified =
          '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:tibfox/mvh7g26e dtube ~~~ after text</p></html>';
      const res = HtmlReady(testString).html;
      expect(res).toEqual(htmlified);
  });

  it('should handle dtube embed', () => {
      const testString =
          '<html><iframe width="560" height="315" src="https://emb.d.tube/#!/dbroze/8lsh5nf7" frameborder="0" allowfullscreen></iframe></html>';
      const htmlified =
          '<html xmlns="http://www.w3.org/1999/xhtml"><div class="videoWrapper"><iframe width="560" height="315" src="https://emb.d.tube/#!/dbroze/8lsh5nf7" frameborder="0" allowfullscreen="allowfullscreen" xmlns="http://www.w3.org/1999/xhtml"></iframe></div></html>';
      const res = HtmlReady(testString).html;
      expect(res).toEqual(htmlified);
  });

  it('should not allow links where the text portion contains smoke.io but the link does not', () => {
    // There isn't an easy way to mock counterpart, even with proxyquire, so we just test for the missing translation message -- ugly but ok

    const steemCase =
        '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://Steemit.com/signup</a></xml>';
    const steemCaseCleaned =
        '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://Steemit.com/signup / https://steamit.com/signup</div></xml>';
    const sccRes = HtmlReady(steemCase).html;
    expect(sccRes).toEqual(steemCaseCleaned);

    const hiveCase =
      '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://h1ve.blog/signup" xmlns="http://www.w3.org/1999/xhtml">https://hive.blog/signup</a></xml>';
    const hiveCaseCleaned =
        '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://hive.blog/signup / https://h1ve.blog/signup</div></xml>';
    const hiveCased = HtmlReady(hiveCase).html;
    expect(hiveCased).toEqual(hiveCaseCleaned);

    const dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://sm0ke.io/signup" xmlns="http://www.w3.org/1999/xhtml">https://smoke.io/signup</a></xml>';
    const cleansed = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://smoke.io/signup / https://sm0ke.io/signup</div></xml>';
    const res = HtmlReady(dirty).html;
    expect(res).to.equal(cleansed);

    const withuser = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://official@smoke.io/signup</a></xml>';
    const cleansedwithuser = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://official@smoke.io/signup / https://steamit.com/signup</div></xml>';
    const reswithuser = HtmlReady(withuser).html;
    expect(reswithuser).to.equal(cleansedwithuser);

    const noendingslash = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com" xmlns="http://www.w3.org/1999/xhtml">https://smoke.io</a></xml>';
    const cleansednoendingslash = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://smoke.io / https://steamit.com</div></xml>';
    const resnoendingslash = HtmlReady(noendingslash).html;
    expect(resnoendingslash).to.equal(cleansednoendingslash);
  });

  it('should allow more than one link per post', () => {
    const somanylinks = '<xml xmlns="http://www.w3.org/1999/xhtml">https://foo.com and https://blah.com</xml>';
    const htmlified = '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="https://foo.com">https://foo.com</a> and <a href="https://blah.com">https://blah.com</a></span></xml>';
    const res = HtmlReady(somanylinks).html;
    expect(res).to.equal(htmlified);
  })
});
