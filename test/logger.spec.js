import test from 'ava';

import sut from '../src/logger';

test('has an debug method', t => {
    t.is(typeof sut.debug, 'function');
});

test('has an info method', t => {
    t.is(typeof sut.info, 'function');
});

test('has an warn method', t => {
    t.is(typeof sut.warn, 'function');
});

test('has an error method', t => {
    t.is(typeof sut.error, 'function');
});
