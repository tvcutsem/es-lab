#Copyright (C) 2009 Google Inc.
#
#Licensed under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License.
#You may obtain a copy of the License at
#
#http://www.apache.org/licenses/LICENSE-2.0
#
#Unless required by applicable law or agreed to in writing, software
#distributed under the License is distributed on an "AS IS" BASIS,
#WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#See the License for the specific language governing permissions and
#limitations under the License.

es5parser_in = src/parser/es5parser.ojs
es5parser_out = $(es5parser_in:%.ojs=%.js)
# beware: these dependencies are deleted upon make clean
es5parser_deps = third_party/json2_mini.js \
                 third_party/ometa/lib_mini.js \
                 third_party/ometa/ometa-base_mini.js \
                 src/parser/unicode_mini.js \
                 src/parser/es5parser_mini.js
bundle = site/esparser/bundle.js

# the javascript shell to use
js = v8 #rhino

all: parser esparser

parser: $(es5parser_out)

# compiles an OMeta grammar (.ojs) into an executable javascript (.js) parser
%.js : %.ojs
	$(js) load-ometa.js -e "OMetaLib.compile('$<')" > $@

# runs the parser unit tests
parsertests : $(es5parser_out)
	time $(js) run-parser-tests.js

# builds the JS minifier
jsmin :
	cc -o jsmin third_party/jsmin.c

# minifies a Javascript source file
%_mini.js: %.js jsmin
	@./jsmin < $< > $@

$(bundle): $(es5parser_deps)
	@mkdir -p "$$(dirname $@)"
	@(for file in $^; do echo // $$file; cat "$${file}"; echo; echo; done) > $@

# builds the parser playground website
esparser: $(bundle)
	@for file in $^; do mv -f $${file} site/$@/`basename $${file}` ; done ;
	@cp -f site/parser.html site/$@/index.html
	@echo 'generated site/$@'

# delete all generated files except site/esparser
clean:
	rm -rf $(es5parser_out) jsmin $(es5parser_deps) 
