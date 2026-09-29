import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    to: '/docs/ai-worker/overview',
    title: 'AI WORKER',
    description: 'ROBOTIS의 semi-humanoid 로봇 FFW-SG2의 하드웨어·소프트웨어 사양과 구동·종료 절차입니다.',
  },
  {
    to: '/docs/meta-quest-3/overview',
    title: 'Meta Quest 3',
    description: 'VR teleoperation에 사용하는 Meta Quest 3의 장비 특징과 기본 사용법입니다.',
  },
  {
    to: '/docs/pipeline/setup',
    title: 'Pipeline',
    description: '모든 조작 방식에 공통으로 필요한 환경 구축, 로봇 구동·종료, 프리드라이브 절차입니다.',
  },
  {
    to: '/docs/interactive-marker/interactive-marker',
    title: 'Interactive Marker',
    description: 'MuJoCo 뷰어의 마커를 끌어 FFW-SG2를 조작하는 Joint / EEF 컨트롤러 사용법입니다.',
  },
  {
    to: '/docs/vr-teleoperation/overview',
    title: 'VR Teleoperation',
    description: '팀 파이프라인으로 FFW-SG2를 face-to-face teleoperation하고 데모를 녹화합니다.',
  },
  {
    to: '/docs/policy-inference/policy-inference',
    title: 'Policy Inference',
    description: '녹화한 데이터로 학습한 LeRobot 정책을 FFW-SG2에서 자율 구동합니다.',
  },
];

function Feature({to, title, description}) {
  return (
    <div className={clsx('col col--4', styles.col)}>
      <Link to={to} className={styles.card}>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardBody}>{description}</p>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
