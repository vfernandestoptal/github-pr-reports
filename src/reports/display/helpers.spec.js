const expect = require('chai').expect;
require('mocha');

const helpers = require('./helpers');

describe('toHours', () => {
    it('should convert moment duration to hours', () => {
        expect(helpers.toHours({ minutes: 120 })).to.equal('2.00');
        expect(helpers.toHours({ minutes: 135 })).to.equal('2.25');
    });
});

describe('alignText', () => {
    it('should pad text to fixed column size', () => {
        expect(helpers.alignText('abc', { align: 'Left', size: 5 })).to.equal(
            'abc  '
        );
    });

    it('should left-align by default', () => {
        expect(helpers.alignText('abc', { size: 5 })).to.equal('abc  ');
    });

    it('should support right aligned columns', () => {
        expect(helpers.alignText('abc', { align: 'Right', size: 5 })).to.equal(
            '  abc'
        );
    });
});
