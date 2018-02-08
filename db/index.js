const Sequelize = require('sequelize');
const _conn = new Sequelize(process.env.DATABASE_URL);

const User = _conn.define('user', {
  name: Sequelize.STRING
});

const Page = _conn.define('page', {
  title: Sequelize.STRING,
  content: Sequelize.TEXT
});

Page.prototype.findSimilar = function(){
  return Page.findAll({
    where: {
      id: { $ne : this.id }
    },
    include: [
      {
        model: Tag,
        where: {
          name: { $in : this.tags.map(tag=> tag.name)}
        }
      }
    ]
  });
}

const Tag = _conn.define('tag', {
  name: Sequelize.STRING
});

Page.belongsTo(User);
User.hasMany(Page);

Page.belongsToMany(Tag, { through: 'pagesTags', foreignKey: 'pageId'});

Page.generatePageFromFormData = function(item){
  const { title, userName, tags, content } = item;
  let page;
  return User.findOne({ where: { name: userName }})
    .then( user => {
      if(user){
        return user;
      }
      return User.create({ name: userName });
    })
    .then( user => {
      return Page.create({title: title, content: content, userId: user.id });
    })
    .then( _page => {
      page = _page;
      return Promise.all(tags.split(' ').map( name => {
        return Tag.findOne({ where: { name }})
          .then( tag => {
            if(tag)
              return tag;
            return Tag.create({ name });
          });
      }));
    })
    .then( tags => {
      return page.addTags(tags);
    });
}

const sync = ()=> {
  return _conn.sync({ force: true });
};

const data = [
  {
    userName: 'moe',
    title: 'I love bitcoin',
    content: 'I love bitcoin because....',
    tags: 'love bitcoin'
  },
  {
    userName: 'moe',
    title: 'I hate bitcoin',
    content: 'I hate bitcon because....',
    tags: 'hate bitcoin'
  },
  {
    userName: 'larry',
    title: 'JavaScript is great',
    content: 'JavaScript is great because....',
    tags: 'JavaScript great'
  }
];

const seed = ()=> {
  return data.reduce((memo, item)=> {
    return memo.then(()=> Page.generatePageFromFormData(item));
  }, Promise.resolve());
}

module.exports = {
  sync,
  seed,
  models: {
    User,
    Page,
    Tag
  }
};
