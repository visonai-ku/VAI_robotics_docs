// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

const GITHUB_REPO = 'https://github.com/visonai-ku/VAI_robotics_docs';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Robotis docs',
  tagline: 'Robotics team docs',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  // GitHub Pages 배포 주소: https://visonai-ku.github.io/VAI_robotics_docs/
  url: 'https://visonai-ku.github.io',
  baseUrl: '/VAI_robotics_docs/',

  organizationName: 'visonai-ku',
  projectName: 'VAI_robotics_docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // 각 페이지 하단 "이 페이지 편집하기" 링크가 이 주소로 연결됩니다.
          editUrl: `${GITHUB_REPO}/tree/main/`,
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          blogTitle: '업데이트',
          blogDescription: '문서 및 시스템 변경 사항 공지',
          blogSidebarTitle: '최근 글',
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: `${GITHUB_REPO}/tree/main/`,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
      type: 'text/css',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/logo.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Robotis docs',
        logo: {
          alt: 'Robotis docs',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: '문서',
          },
          {
            href: GITHUB_REPO,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '문서',
            items: [
              {label: '시작하기', to: '/docs/intro'},
              {label: '문서 기여 방법', to: '/docs/contributing'},
            ],
          },
          {
            title: '팀',
            items: [
              {label: 'GitHub 저장소', href: GITHUB_REPO},
              {label: '이슈 등록', href: `${GITHUB_REPO}/issues`},
            ],
          },
          {
            title: '더 보기',
            items: [
              {label: 'Docusaurus 문서', href: 'https://docusaurus.io/'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VAI. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'python'],
      },
    }),
};

export default config;
