LIB = lib/shibari.js
SRC = $(shell find src -type f)
TEST = $(shell find test -type f)

.PHONY: build watch test clean

build: $(LIB) src/.linted

watch: build
	http-server -p 3000 -c-1 ./public & \
	watchy -w src/**/* -- make build

test: build test/.linted
	karma start

clean:
	rm -rf lib/* lib/.linted

lib/%.js: src/%.js $(SRC)
	browserify \
		--standalone shibari \
		--global-transform [ uglifyify [ --no-drop_debugger ] ] \
		$< > $@

src/.linted: $(SRC)
	jscs $?
	jshint $?
	@touch $@

test/.linted: $(TEST)
	jscs $?
	jshint $?
	@touch $@
