LIB = lib/shibari.js
SRC = $(shell find src -type f)

.PHONY: build watch test clean

build: $(LIB) lib/.linted

watch: build
	http-server -p 3000 -c-1 ./public & \
	watchy -w src/**/* -- make build

test: build
	#TODO

clean:
	rm -rf lib/* lib/.linted

lib/%.js: src/%.js $(SRC)
	browserify \
		--standalone shibari \
		--global-transform [ uglifyify [ --no-drop_debugger ] ] \
		$< > $@

lib/.linted: $(SRC)
	jscs $?
	jshint $?
	@touch $@
