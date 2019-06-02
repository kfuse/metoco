# Makefile for metoco application

all: build

build:
	@npx uglifyjs -c -o js/data-min.js js/data.js
	@npx uglifyjs -c -o js/util-min.js js/util.js
	@npx uglifyjs -c -o js/slide-min.js js/slide.js
	@npx uglifyjs -c -o js/app-min.js js/app.js
	@npx sass css/style.scss:css/style.css --style compressed
	@echo compress [OK]

