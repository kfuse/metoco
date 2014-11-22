# Makefile for metoco application

all: build

build:
	@uglifyjs -c -o js/data-min.js js/data.js
	@uglifyjs -c -o js/util-min.js js/util.js
	@uglifyjs -c -o js/slide-min.js js/slide.js
	@uglifyjs -c -o js/app-min.js js/app.js
	@echo compress [OK]

