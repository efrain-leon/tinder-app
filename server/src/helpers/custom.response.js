import express from 'express';

express.response.ok = function(response) {
	this.status(200);
	this.json({response: response || {}, error: ''});
};

express.response.badRequest = function(err) {
	this.status(400);
	this.json(err || {error: 'Request could not be handled', value: ''});
};

express.response.unauthorized = function(err) {
	this.status(401);
	this.json(err || {error: 'Unauthorized', value: ''});
};

express.response.forbidden = function(err) {
	this.status(403);
	this.json(err || {error: 'This request is forbidden', value: ''});
};

express.response.notFound = function(err) {
	this.status(404);
	this.json(err || {error: 'Not found', value: ''});
};

express.response.conflict = function(err) {
	this.status(409);
	this.json(err || {message: "Conflict!", value: ''});
}

express.response.unprocessableEntity = function(err) {
	this.status(422);
	this.json(err || {error: 'Unprocessable Entity', value: ''});
};

express.response.serverError = function(err) {
	this.status(500);
	this.json(err || {error: 'We\'re sorry, a server error occurred. Please wait a bit and try again', value: ''});
};

express.response.resetContent = function(err) {
	this.status(501);
	this.json(err || {error: "Something went wrong... Please reload", value: ''});
}