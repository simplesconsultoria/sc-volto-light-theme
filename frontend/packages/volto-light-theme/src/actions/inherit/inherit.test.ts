import { describe, expect, it } from 'vitest';
import { getInherit } from './inherit';
import { GET_INHERIT } from '../../constants/ActionTypes';

describe('getInherit', () => {
  it('builds a GET request against the @inherit service', () => {
    expect(getInherit('/a-page', ['sc.voltolighttheme.footer'])).toEqual({
      type: GET_INHERIT,
      request: {
        op: 'get',
        path: '/a-page/@inherit?expand.inherit.behaviors=sc.voltolighttheme.footer',
      },
    });
  });

  it('joins several behaviors with a comma, preserving order', () => {
    const { request } = getInherit('/a-page', [
      'sc.voltolighttheme.siteheader',
      'sc.voltolighttheme.footer',
    ]);
    expect(request.path).toBe(
      '/a-page/@inherit?expand.inherit.behaviors=sc.voltolighttheme.siteheader,sc.voltolighttheme.footer',
    );
  });
});
