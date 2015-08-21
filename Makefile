SOURCES ?= lib/*.js
TESTS ?= test/*.test.js test/**/*.test.js test/integration/node/*.test.js

test: test-mocha
test-cov: test-istanbul-mocha
view-cov: view-istanbul-report
lint: lint-jshint
lint-tests: lint-tests-jshint


# ==============================================================================
# Node.js
# ==============================================================================
include support/mk/node.mk
include support/mk/mocha.mk
include support/mk/istanbul.mk

# ==============================================================================
# Analysis
# ==============================================================================
include support/mk/notes.mk
include support/mk/jshint.mk

# ==============================================================================
# Reports
# ==============================================================================
include support/mk/coveralls.mk

# ==============================================================================
# Continuous Integration
# ==============================================================================
submit-cov-to-coveralls: submit-istanbul-lcov-to-coveralls

# Travis CI
ci-travis: test test-cov

# ==============================================================================
# Clean
# ==============================================================================
clean:
	rm -rf build
	rm -rf reports

clobber: clean clobber-node


doc: doc-jsdoc
doc-jsdoc:
	jsdoc $(SOURCES)
# dox@0.8.0
doc-dox:
	cat $(SOURCES) | dox
# doxx@1.5.0
doc-doxx:
	doxx --source lib --target docs
# dox-docco@0.3.0
doc-dox-docco:
	cat $(SOURCES) | dox-docco > out/docco.html
# dox-foundation@0.5.6
doc-dox-foundation:
	dox-foundation --source lib --target docs

view-doc: view-jsdoc
view-jsdoc:
	open out/index.html

.PHONY: test test-cov view-cov lint lint-tests submit-cov-to-coveralls ci-travis clean clobber
