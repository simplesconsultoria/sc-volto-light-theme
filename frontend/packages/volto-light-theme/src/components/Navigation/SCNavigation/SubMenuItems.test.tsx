import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SubMenuItems from './SubMenuItems';
import SubMenuItem from './SubMenuItem';

vi.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('SubMenuItems & SubMenuItem limits', () => {
  it('limits submenu items to maximum 8 items', () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      title: `Item ${i + 1}`,
      url: `/item-${i + 1}`,
    }));

    render(<SubMenuItems items={items} pathname="/" closeMenu={() => {}} />);

    // Each of the 8 items without children is rendered as a link or wrapper
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles).toHaveLength(8);
    expect(titles[0].textContent).toBe('Item 1');
    expect(titles[7].textContent).toBe('Item 8');
  });

  it('limits nested sub-items to maximum 2 items', () => {
    const itemWithManyChildren = {
      title: 'Parent Item',
      url: '/parent',
      items: [
        { title: 'Child 1', url: '/parent/child-1' },
        { title: 'Child 2', url: '/parent/child-2' },
        { title: 'Child 3', url: '/parent/child-3' },
        { title: 'Child 4', url: '/parent/child-4' },
      ],
    };

    const { container } = render(
      <SubMenuItem
        item={itemWithManyChildren}
        pathname="/"
        closeMenu={() => {}}
      />,
    );

    const childLinks = container.querySelectorAll('.subitem-child-link');
    expect(childLinks).toHaveLength(2);
    expect(childLinks[0].textContent).toContain('Child 1');
    expect(childLinks[1].textContent).toContain('Child 2');
  });
});
