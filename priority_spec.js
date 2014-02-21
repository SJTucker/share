/* jshint expr:true */

'use strict';

process.env.DBNAME = 'todo-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;
var Priority;

describe('priorities', function(){

  before(function(done){
    var connect = require('../../app/lib/mongodb-connection-pool');
    connect('todo-test', function(){
      Priority = global.nss.Priority;
      done();
    });
  });

  beforeEach(function(done){
    var p1 = new Priority({name:'High', value:'10'});
    var p2 = new Priority({name:'Medium', value:'5'});
    var p3 = new Priority({name:'Low', value:'1'});

    p1.save(function(){
      p2.save(function(){
        p3.save(function(){
          done();
        });
      });
    });
  });

  afterEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      done();
    });
  });

  describe('POST /priorities', function(){
    it('should create a new priority', function(done){
      request(app)
      .post('/priorities')
      .send({name:'Urgent', value:'12'})
      .end(function(err, res){
        expect(res.body.name).to.equal('Urgent');
        expect(res.body.value).to.deep.equal(12);
        expect(res.body._id).to.have.length(24);
        done();
      });
    });
  });

  describe('GET /priorities', function(){
    it('should return all priorites in the database', function(done){
      request(app)
      .get('/priorities')
      .end(function(err, res){
        expect(res.body.priorities).to.have.length(3);
        expect(res.body.priorities[0].name).to.be.ok;
        expect(res.body.priorities[0].value).to.be.above(0);
        expect(res.body.priorities[0]._id).to.have.length(24);
        done();
      });
    });
  });

  describe('GET /priorities/3', function(){
    it('should return a specific priority from the database', function(done){
      Priority.findByName('Medium', function(priority){
        var id = priority._id.toString();

        request(app)
        .get('/priorities/' + id)
        .end(function(err, res){
          expect(res.body.name).to.equal('Medium');
          expect(res.body.value).to.deep.equal(5);
          expect(res.body._id).to.equal(id);
          done();
        });
      });
    });
  });

  describe('DELETE /priorities/3', function(){
    it('should delete a specific priority from the database', function(done){
      Priority.findByName('Medium', function(priority){
        var id = priority._id.toString();

        request(app)
        .del('/priorities/' + id)
        .end(function(err, res){
          expect(res.body.count).to.equal(1);
          done();
        });
      });
    });
  });

  describe('PUT /priorities/3', function(){
    it('should update a specific priority in the database', function(done){
      Priority.findByName('Medium', function(priority){
        var id = priority._id.toString();

        priority.name = 'Above Average';
        priority.value = '7';

        request(app)
        .put('/priorities/' + id)
        .send(priority)
        .end(function(err, res){
          expect(res.body.name).to.equal('Above Average');
          expect(res.body.value).to.deep.equal(7);
          expect(res.body._id).to.equal(id);
          done();
        });
      });
    });
  });

});

