import {
  Circle,
  Layout,
  Line,
  makeScene2D,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  createRefArray,
  createSignal,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  linear,
  loop,
  range,
  sequence,
  useRandom,
  useThread,
  waitFor,
} from '@motion-canvas/core';

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const BG = '#0b1324';
const PANEL = '#13203a';
const TEXT = '#f3f5f9';
const MUTED = '#8fa3c0';
const ORANGE = '#ff8a2a';
const AMBER = '#ffc145';
const TEAL = '#2ec4b6';
const BLUE = '#3a86ff';
const RED = '#ef3b3b';
const STEEL = '#2b3c5c';
const STEEL_LIGHT = '#3d5478';

const FONT = 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TOTAL_DURATION = 30;

export default makeScene2D(function* (view) {
  view.fill(BG);
  const random = useRandom(1904);

  // -------------------------------------------------------------------------
  // Persistent background: subtle grid + glow
  // -------------------------------------------------------------------------
  const grid = createRef<Node>();
  view.add(
    <Node ref={grid} opacity={0}>
      {range(-10, 11).map(i => (
        <Line
          points={[
            [i * 100, -600],
            [i * 100, 600],
          ]}
          stroke={'#16243f'}
          lineWidth={1}
        />
      ))}
      {range(-6, 7).map(i => (
        <Line
          points={[
            [-1000, i * 100],
            [1000, i * 100],
          ]}
          stroke={'#16243f'}
          lineWidth={1}
        />
      ))}
    </Node>,
  );

  // Progress bar at bottom (runs the whole 30s)
  const progress = createRef<Rect>();
  view.add(
    <Rect
      ref={progress}
      x={-960}
      y={536}
      offset={[-1, 0]}
      width={0}
      height={8}
      fill={ORANGE}
    />,
  );

  // =========================================================================
  // SCENE 1 — Title with refinery skyline (0s – 5s)
  // =========================================================================
  const skyline = createRef<Node>();
  const towers = createRefArray<Rect>();
  const tanks = createRefArray<Circle>();
  const flame = createRef<Circle>();
  const flameCore = createRef<Circle>();
  const titleTop = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const titleBar = createRef<Rect>();

  const towerSpecs = [
    {x: -560, w: 70, h: 300},
    {x: -470, w: 46, h: 220},
    {x: -300, w: 90, h: 380},
    {x: -180, w: 54, h: 260},
    {x: 250, w: 80, h: 340},
    {x: 360, w: 50, h: 200},
    {x: 600, w: 40, h: 460}, // flare stack
  ];
  const tankSpecs = [
    {x: -760, r: 90},
    {x: -40, r: 110},
    {x: 110, r: 80},
    {x: 790, r: 100},
  ];
  const groundY = 470;

  view.add(
    <Node ref={skyline}>
      <Rect
        x={0}
        y={groundY + 40}
        width={1920}
        height={80}
        fill={'#0f1a30'}
      />
      {tankSpecs.map(t => (
        <Circle
          ref={tanks}
          x={t.x}
          y={groundY}
          width={t.r * 2}
          height={t.r * 2}
          startAngle={180}
          endAngle={360}
          closed
          fill={STEEL}
          stroke={STEEL_LIGHT}
          lineWidth={4}
          scale={0}
        />
      ))}
      {towerSpecs.map((t, i) => (
        <Rect
          ref={towers}
          x={t.x}
          y={groundY}
          offset={[0, 1]}
          width={t.w}
          height={0}
          radius={[t.w / 2, t.w / 2, 0, 0]}
          fill={i === towerSpecs.length - 1 ? STEEL_LIGHT : STEEL}
          stroke={STEEL_LIGHT}
          lineWidth={3}
        />
      ))}
      <Circle
        ref={flame}
        x={600}
        y={groundY - 470}
        size={0}
        fill={ORANGE}
        shadowColor={ORANGE}
        shadowBlur={60}
      />
      <Circle
        ref={flameCore}
        x={600}
        y={groundY - 466}
        size={0}
        fill={AMBER}
      />
    </Node>,
  );

  view.add(
    <Layout layout direction={'column'} alignItems={'center'} y={-170} gap={18}>
      <Txt
        ref={titleTop}
        text={'PERTAMINA'}
        fontFamily={FONT}
        fontSize={34}
        fontWeight={700}
        letterSpacing={14}
        fill={ORANGE}
        opacity={0}
      />
      <Txt
        ref={title}
        text={'Refinery Unit III Plaju'}
        fontFamily={FONT}
        fontSize={104}
        fontWeight={800}
        fill={TEXT}
        opacity={0}
      />
      <Rect ref={titleBar} width={0} height={6} radius={3} fill={ORANGE} />
      <Txt
        ref={subtitle}
        text={'Kilang minyak di Palembang, Sumatera Selatan'}
        fontFamily={FONT}
        fontSize={40}
        fill={MUTED}
        opacity={0}
      />
    </Layout>,
  );

  // Progress bar runs in background for full duration
  yield progress().width(1920, TOTAL_DURATION, linear);

  // Flare flicker loop (background)
  const flicker = createSignal(0);
  yield loop(Infinity, function* () {
    const s = 0.85 + random.nextFloat(0, 0.3);
    yield* flicker(s, 0.12);
  });

  yield* all(
    grid().opacity(1, 1),
    sequence(
      0.08,
      ...towers.map((tw, i) =>
        tw.height(towerSpecs[i].h, 0.8, easeOutCubic),
      ),
    ),
    sequence(0.1, ...tanks.map(t => t.scale(1, 0.6, easeOutBack))),
    chain(
      waitFor(0.4),
      all(
        titleTop().opacity(1, 0.6),
        title().opacity(1, 0.8),
        title().y(0, 0.8, easeOutCubic),
      ),
    ),
  );

  flame().size(() => 70 * flicker());
  flameCore().size(() => 34 * flicker());
  yield* all(
    titleBar().width(520, 0.6, easeInOutCubic),
    subtitle().opacity(1, 0.6),
  );
  yield* waitFor(2.2);

  // Transition out scene 1 (keep skyline but dim it)
  yield* all(
    titleTop().opacity(0, 0.5),
    title().opacity(0, 0.5),
    subtitle().opacity(0, 0.5),
    titleBar().width(0, 0.5),
    skyline().opacity(0.18, 0.6),
  );
  // ~5.0s

  // =========================================================================
  // SCENE 2 — Location on the Musi river (5s – 10.5s)
  // =========================================================================
  const locHeader = createRef<Txt>();
  const river = createRef<Line>();
  const komering = createRef<Line>();
  const pinPlaju = createRef<Node>();
  const pinSG = createRef<Node>();
  const riverLabel = createRef<Txt>();
  const komeringLabel = createRef<Txt>();
  const cityLabel = createRef<Txt>();

  const Pin = ({
    refNode,
    x,
    y,
    label,
    color,
    labelY,
  }: {
    refNode: ReturnType<typeof createRef<Node>>;
    x: number;
    y: number;
    label: string;
    color: string;
    labelY: number;
  }) => (
    <Node ref={refNode} x={x} y={y} scale={0}>
      <Circle size={70} fill={color} opacity={0.25} />
      <Circle size={34} fill={color} stroke={TEXT} lineWidth={5} />
      <Rect
        y={labelY}
        padding={[14, 26]}
        radius={14}
        fill={PANEL}
        stroke={color}
        lineWidth={3}
        layout
      >
        <Txt
          text={label}
          fontFamily={FONT}
          fontSize={36}
          fontWeight={700}
          fill={TEXT}
        />
      </Rect>
    </Node>
  );

  view.add(
    <>
      <Txt
        ref={locHeader}
        text={'LOKASI'}
        y={-420}
        fontFamily={FONT}
        fontSize={36}
        fontWeight={700}
        letterSpacing={12}
        fill={ORANGE}
        opacity={0}
      />
      <Line
        ref={river}
        points={[
          [-900, -60],
          [-600, -140],
          [-300, -40],
          [0, 40],
          [300, -20],
          [600, 60],
          [900, 0],
        ]}
        radius={180}
        stroke={BLUE}
        lineWidth={46}
        lineCap={'round'}
        end={0}
        opacity={0.9}
      />
      <Line
        ref={komering}
        points={[
          [60, 420],
          [20, 260],
          [80, 140],
          [20, 40],
        ]}
        radius={180}
        stroke={BLUE}
        lineWidth={28}
        lineCap={'round'}
        end={0}
        opacity={0.75}
      />
      <Txt
        ref={riverLabel}
        text={'Sungai Musi'}
        x={-560}
        y={-220}
        fontFamily={FONT}
        fontSize={38}
        fontStyle={'italic'}
        fill={'#9cc2ff'}
        opacity={0}
      />
      <Txt
        ref={komeringLabel}
        text={'Sungai Komering'}
        x={260}
        y={330}
        fontFamily={FONT}
        fontSize={32}
        fontStyle={'italic'}
        fill={'#9cc2ff'}
        opacity={0}
      />
      <Txt
        ref={cityLabel}
        text={'Palembang, Sumatera Selatan'}
        y={420}
        fontFamily={FONT}
        fontSize={44}
        fontWeight={600}
        fill={TEXT}
        opacity={0}
      />
      <Pin
        refNode={pinPlaju}
        x={-120}
        y={70}
        label={'Kilang Plaju'}
        color={ORANGE}
        labelY={100}
      />
      <Pin
        refNode={pinSG}
        x={420}
        y={-60}
        label={'Kilang Sungai Gerong'}
        color={TEAL}
        labelY={-100}
      />
    </>,
  );

  yield* all(
    locHeader().opacity(1, 0.5),
    river().end(1, 1.2, easeInOutCubic),
    chain(waitFor(0.5), komering().end(1, 0.8, easeInOutCubic)),
    chain(
      waitFor(0.6),
      all(riverLabel().opacity(1, 0.5), komeringLabel().opacity(1, 0.5)),
    ),
  );
  yield* sequence(
    0.35,
    pinPlaju().scale(1, 0.6, easeOutBack),
    pinSG().scale(1, 0.6, easeOutBack),
    cityLabel().opacity(1, 0.6),
  );
  yield* waitFor(2.2);
  yield* all(
    locHeader().opacity(0, 0.5),
    river().start(1, 0.6, easeInOutCubic),
    komering().start(1, 0.6, easeInOutCubic),
    riverLabel().opacity(0, 0.4),
    komeringLabel().opacity(0, 0.4),
    cityLabel().opacity(0, 0.4),
    pinPlaju().scale(0, 0.5),
    pinSG().scale(0, 0.5),
  );
  // ~10.5s

  // =========================================================================
  // SCENE 3 — History timeline (10.5s – 16.5s)
  // =========================================================================
  const histHeader = createRef<Txt>();
  const timeline = createRef<Line>();
  const events = createRefArray<Node>();

  const eventSpecs = [
    {
      x: -560,
      year: '1904',
      text: 'Kilang Plaju dibangun\noleh Shell (BPM)',
      color: ORANGE,
    },
    {
      x: 0,
      year: '1926',
      text: 'Kilang Sungai Gerong\ndibangun oleh Stanvac',
      color: TEAL,
    },
    {
      x: 560,
      year: '1965 & 1970',
      text: 'Kedua kilang diambil alih\nPertamina',
      color: RED,
    },
  ];

  view.add(
    <>
      <Txt
        ref={histHeader}
        text={'SEJARAH LEBIH DARI 120 TAHUN'}
        y={-380}
        fontFamily={FONT}
        fontSize={36}
        fontWeight={700}
        letterSpacing={10}
        fill={ORANGE}
        opacity={0}
      />
      <Line
        ref={timeline}
        points={[
          [-800, 0],
          [800, 0],
        ]}
        stroke={STEEL_LIGHT}
        lineWidth={8}
        lineCap={'round'}
        end={0}
      />
      {eventSpecs.map(e => (
        <Node ref={events} x={e.x} opacity={0} y={30}>
          <Circle size={40} fill={e.color} stroke={BG} lineWidth={6} />
          <Txt
            y={-90}
            text={e.year}
            fontFamily={FONT}
            fontSize={e.year.length > 4 ? 60 : 76}
            fontWeight={800}
            fill={e.color}
          />
          <Txt
            y={110}
            text={e.text}
            fontFamily={FONT}
            fontSize={34}
            lineHeight={48}
            textAlign={'center'}
            fill={TEXT}
          />
        </Node>
      ))}
    </>,
  );

  yield* all(
    histHeader().opacity(1, 0.5),
    timeline().end(1, 1, easeInOutCubic),
  );
  yield* sequence(
    0.6,
    ...events.map(ev => all(ev.opacity(1, 0.5), ev.y(0, 0.5, easeOutCubic))),
  );
  yield* waitFor(2.7);
  yield* all(
    histHeader().opacity(0, 0.5),
    timeline().start(1, 0.6),
    ...events.map(ev => ev.opacity(0, 0.4)),
  );
  // ~16.6s

  // =========================================================================
  // SCENE 4 — Capacity + process flow (16.6s – 22.6s)
  // =========================================================================
  const capHeader = createRef<Txt>();
  const capValue = createSignal(0);
  const capNumber = createRef<Txt>();
  const capUnit = createRef<Txt>();
  const flowBoxes = createRefArray<Rect>();
  const flowArrows = createRefArray<Line>();

  const flowSpecs = [
    {label: 'Minyak Mentah', color: STEEL_LIGHT},
    {label: 'Distilasi & Konversi', color: ORANGE},
    {label: 'BBM & Petrokimia', color: TEAL},
  ];
  const flowX = [-560, 0, 560];

  view.add(
    <>
      <Txt
        ref={capHeader}
        text={'KAPASITAS PENGOLAHAN'}
        y={-400}
        fontFamily={FONT}
        fontSize={36}
        fontWeight={700}
        letterSpacing={10}
        fill={ORANGE}
        opacity={0}
      />
      <Txt
        ref={capNumber}
        y={-210}
        text={() => `± ${Math.round(capValue())}`}
        fontFamily={FONT}
        fontSize={200}
        fontWeight={800}
        fill={TEXT}
        opacity={0}
      />
      <Txt
        ref={capUnit}
        y={-70}
        text={'ribu barel minyak mentah per hari'}
        fontFamily={FONT}
        fontSize={44}
        fill={MUTED}
        opacity={0}
      />
      {flowSpecs.map((f, i) => (
        <Rect
          ref={flowBoxes}
          x={flowX[i]}
          y={180}
          width={400}
          height={140}
          radius={24}
          fill={PANEL}
          stroke={f.color}
          lineWidth={5}
          scale={0}
        >
          <Txt
            text={f.label}
            fontFamily={FONT}
            fontSize={36}
            fontWeight={700}
            fill={TEXT}
          />
        </Rect>
      ))}
      {[0, 1].map(i => (
        <Line
          ref={flowArrows}
          points={[
            [flowX[i] + 215, 180],
            [flowX[i + 1] - 215, 180],
          ]}
          stroke={AMBER}
          lineWidth={8}
          endArrow
          arrowSize={22}
          end={0}
        />
      ))}
    </>,
  );

  yield* all(
    capHeader().opacity(1, 0.5),
    capNumber().opacity(1, 0.4),
    capValue(118, 1.6, easeOutCubic),
    chain(waitFor(0.8), capUnit().opacity(1, 0.5)),
  );
  yield* chain(
    flowBoxes[0].scale(1, 0.4, easeOutBack),
    flowArrows[0].end(1, 0.35),
    flowBoxes[1].scale(1, 0.4, easeOutBack),
    flowArrows[1].end(1, 0.35),
    flowBoxes[2].scale(1, 0.4, easeOutBack),
  );
  yield* waitFor(1.8);
  yield* all(
    capHeader().opacity(0, 0.4),
    capNumber().opacity(0, 0.4),
    capUnit().opacity(0, 0.4),
    ...flowBoxes.map(b => b.scale(0, 0.4)),
    ...flowArrows.map(a => a.opacity(0, 0.3)),
  );
  // ~22.4s

  // =========================================================================
  // SCENE 5 — Products (22.4s – 27.2s)
  // =========================================================================
  const prodHeader = createRef<Txt>();
  const products = createRefArray<Rect>();
  const productSpecs = [
    {name: 'Gasoline', note: 'Pertalite & Pertamax', color: ORANGE},
    {name: 'Avtur', note: 'Bahan bakar pesawat', color: BLUE},
    {name: 'Solar', note: 'Biosolar / diesel', color: AMBER},
    {name: 'LPG', note: 'Elpiji rumah tangga', color: TEAL},
    {name: 'Polypropylene', note: 'Polytam (bijih plastik)', color: '#b388ff'},
    {name: 'Musicool', note: 'Refrigeran hidrokarbon', color: '#5ad1ff'},
  ];

  view.add(
    <>
      <Txt
        ref={prodHeader}
        text={'PRODUK UNGGULAN'}
        y={-390}
        fontFamily={FONT}
        fontSize={36}
        fontWeight={700}
        letterSpacing={10}
        fill={ORANGE}
        opacity={0}
      />
      {productSpecs.map((p, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <Rect
            ref={products}
            x={(col - 1) * 540}
            y={-110 + row * 270}
            width={480}
            height={220}
            radius={28}
            fill={PANEL}
            stroke={p.color}
            lineWidth={4}
            scale={0}
            layout
            direction={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            gap={14}
          >
            <Rect width={60} height={8} radius={4} fill={p.color} />
            <Txt
              text={p.name}
              fontFamily={FONT}
              fontSize={50}
              fontWeight={800}
              fill={TEXT}
            />
            <Txt
              text={p.note}
              fontFamily={FONT}
              fontSize={30}
              fill={MUTED}
            />
          </Rect>
        );
      })}
    </>,
  );

  yield* all(
    prodHeader().opacity(1, 0.5),
    sequence(0.15, ...products.map(p => p.scale(1, 0.5, easeOutBack))),
  );
  yield* waitFor(3.0);
  yield* all(
    prodHeader().opacity(0, 0.4),
    sequence(0.05, ...products.map(p => p.scale(0, 0.35))),
  );
  // ~27.2s

  // =========================================================================
  // SCENE 6 — Outro (27.2s – 30s)
  // =========================================================================
  const outro = createRef<Layout>();
  const outroLine1 = createRef<Txt>();
  const outroLine2 = createRef<Txt>();
  view.add(
    <Layout
      ref={outro}
      layout
      direction={'column'}
      alignItems={'center'}
      gap={24}
      y={-160}
    >
      <Txt
        ref={outroLine1}
        text={'Energi dari Sumatera Selatan untuk Negeri'}
        fontFamily={FONT}
        fontSize={70}
        fontWeight={800}
        fill={TEXT}
        opacity={0}
      />
      <Txt
        ref={outroLine2}
        text={'RU III Plaju · bagian dari PT Kilang Pertamina Internasional'}
        fontFamily={FONT}
        fontSize={36}
        fill={MUTED}
        opacity={0}
      />
    </Layout>,
  );

  yield* all(
    skyline().opacity(1, 0.8),
    outroLine1().opacity(1, 0.6),
    chain(waitFor(0.3), outroLine2().opacity(1, 0.6)),
  );

  // Hold until exactly 30 seconds
  const elapsed = useThread().time();
  yield* waitFor(Math.max(0, TOTAL_DURATION - elapsed));
});

