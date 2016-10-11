const {assert} = require('chai');
const {jsdom} = require('jsdom');

const {dom, func, out, rule, ruleset, score, type} = require('../index');

describe('Ruleset', function () {
    it('get()s by arbitrary passed-in LHSs (and scores dom() nodes at 1)', function () {
        const doc = jsdom(`
            <div>Hooooooo</div>
        `);
        const rules = ruleset(
            rule(dom('div'), type('paragraphish'))
        );
        const facts = rules.against(doc);
        const div = facts.get(type('paragraphish'))[0];
        assert.equal(div.getScore('paragraphish'), 1);
    });

    it('get()s results by out-rule key', function () {
        const doc = jsdom(`
            <div>Hooooooo</div>
        `);
        const rules = ruleset(
            rule(dom('div'), type('paragraphish')),
            rule(type('paragraphish'), out('p'))
        );
        assert.equal(rules.against(doc).get('p').length, 1);
    });

    it('get()s the fnode corresponding to a passed-in node', function () {
        const doc = jsdom(`
            <div>Hooooooo</div>
        `);
        const rules = ruleset(
            rule(dom('div'), type('paragraphish')),  // when we add .score(1), the test passes.
            rule(type('paragraphish'), func(node => ({score: node.element.textContent.length})))
        );
        const facts = rules.against(doc);
        const div = facts.get(doc.querySelectorAll('div')[0]);
        assert.equal(div.getScore('paragraphish'), 8);
    });

    it('assigns scores and notes to nodes', function () {
        // Test the score() and note() calls themselves as well as the ruleset
        // that obeys them.
        const doc = jsdom(`
            <p>
                <a class="good" href="https://github.com/jsdom">Good!</a>
                <a class="bad" href="https://github.com/jsdom">Bad!</a>
            </p>
        `);
        const rules = ruleset(
            rule(dom('a[class=good]'), score(2).type('anchor').note(fnode => 'lovely'))
        );
        const anchors = rules.against(doc).get(type('anchor'));
        // Make sure dom() selector actually discriminates:
        assert.equal(anchors.length, 1);
        const anchor = anchors[0];
        assert.equal(anchor.getScore('anchor'), 2);
        assert.equal(anchor.getNote('anchor'), 'lovely');
    });
});


// TODO: Test note() behavior with one rule giving a note and another giving an undefined note