const expect = require('chai').expect;
const db = require('../db');
const { Page, Tag, User } = db.models;

describe('models', ()=> {
  beforeEach(()=> {
    return db.sync()
            .then(()=> db.seed());
  });
  describe('seeded data', ()=> {
    let pages;
    beforeEach(()=> {
      return Page.findAll({})
              .then( _pages => pages = _pages);
    });

    it('there are 3 pages', ()=> {
      expect(pages.length).to.equal(3);
    });
    describe('i love bitcoin page', ()=> {
      let page
      beforeEach(()=> {
        return Page.findOne({ 
          where: { title: 'I love bitcoin'},
          include: [ Tag, User ]
        })
        .then( _page => {
          page = _page;
        });
      });
      it('exists', ()=> {
        expect(page).to.be.ok;
      });
      it('has two tags', ()=> {
        expect(page.tags.length).to.equal(2);
      });
      it('moe wrote it', ()=> {
        expect(page.user.name).to.equal('moe');
      });
    });
    describe('similarPages', ()=> {
      let similarPages;
      beforeEach(()=> {
        return Page.findOne({
          where: { title: 'I love bitcoin' },
          include: [ Tag ]
        })
          .then( page => page.findSimilar())
          .then(_similarPages => similarPages = _similarPages);

      });
      it('has one similar page', ()=> {
        expect(similarPages.length).to.equal(1);
        expect(similarPages[0].title).to.equal('I hate bitcoin');
      });
    });
    
  });

});
