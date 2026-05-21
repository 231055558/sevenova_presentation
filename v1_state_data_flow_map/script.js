const data = window.ALFA_FLOW_DATA
let selectedStateId = 'WAIT_PERCEPTION'
let hoveredStateId = null
let viewLayer = 'all'
let selectedDataId = null

const stateById = Object.fromEntries(data.states.map(s => [s.id, s]))

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value
    else if (key === 'html') node.innerHTML = value
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value)
    else node.setAttribute(key, value)
  }
  for (const child of children) node.append(child)
  return node
}

function chip(text, cls = '') { return el('span', { class: `chip ${cls}` }, [text]) }
function listChips(items, cls = '') { return el('div', { class: 'chips' }, (items || []).map(x => chip(x, cls))) }

function relatedIds(id) {
  const set = new Set([id])
  for (const edge of data.edges) {
    if (edge[0] === id) set.add(edge[1])
    if (edge[1] === id) set.add(edge[0])
  }
  return set
}

function renderLegend() {
  const root = document.getElementById('layerLegend')
  root.replaceChildren(...data.layers.map(layer => el('div', { class: `layer-pill ${layer.color}` }, [
    el('b', {}, [`${layer.id} · ${layer.title}`]),
    el('span', {}, [layer.desc])
  ])))
}

function renderFlow() {
  const root = document.getElementById('flowRows')
  const visible = data.states.filter(s => viewLayer === 'all' || s.layer === viewLayer)
  const rows = []
  for (let i = 0; i < visible.length; i += 5) rows.push(visible.slice(i, i + 5))
  const related = relatedIds(hoveredStateId || selectedStateId)
  root.replaceChildren(...rows.map(row => el('div', { class: 'flow-row' }, row.map(state => {
    const active = state.id === selectedStateId
    const dimmed = (hoveredStateId || selectedStateId) && !related.has(state.id)
    return el('article', {
      class: `state-card ${state.type} ${active ? 'active' : ''} ${dimmed ? 'dimmed' : ''}`,
      onpointerdown: () => { selectedStateId = state.id; renderAll() },
      onclick: () => { selectedStateId = state.id; renderAll() }
    }, [
      el('div', { class: 'state-meta' }, [el('span', {}, [state.layer]), el('span', {}, [state.type])]),
      el('span', { class: 'state-title' }, [state.title]),
      el('code', {}, [state.id]),
      el('small', {}, [state.stage]),
      el('div', { class: 'tags' }, [
        state.slot ? el('span', { class: 'tag slot' }, ['slot']) : el('span', { class: 'tag' }, ['task']),
        state.scene ? el('span', { class: 'tag scene' }, ['scene']) : el('span', { class: 'tag' }, ['no scene'])
      ])
    ])
  }))))
}

function renderDetail() {
  const state = stateById[selectedStateId] || data.states[0]
  const panel = document.getElementById('detailPanel')
  panel.replaceChildren(
    el('div', { class: 'detail-kicker' }, [`${state.layer} · ${state.type}`]),
    el('div', { class: 'detail-title' }, [state.title]),
    el('code', {}, [`${state.id} → ${state.stage}`]),
    el('p', { class: 'detail-desc' }, [state.desc]),
    el('div', { class: 'flag-row' }, [
      el('span', { class: `flag ${state.slot ? 'on' : ''}` }, [state.slot ? 'slot 级结果' : '任务级结果']),
      el('span', { class: `flag ${state.scene ? 'on' : ''}` }, [state.scene ? 'MoveIt 场景硬门槛' : '无场景更新'])
    ]),
    section('读取数据', listChips(state.reads)),
    section('输出数据', listChips(state.writes)),
    section('成功条件', el('p', {}, [state.success])),
    section('失败 status', listChips(state.failures, 'fail')),
    section('恢复 action', listChips(state.recovery, 'recovery')),
    section('下一状态', listChips(state.next, 'next')),
    section('说明', el('p', {}, [state.note || '']))
  )
}

function section(title, content) { return el('div', { class: 'detail-section' }, [el('h3', {}, [title]), content]) }

function renderLayerSwitch() {
  document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewLayer)
    btn.onclick = () => { viewLayer = btn.dataset.view; renderAll() }
  })
}

function renderData() {
  const grid = document.getElementById('dataGrid')
  grid.replaceChildren(...data.dataObjects.map(obj => {
    const users = data.states.filter(s => s.reads.includes(obj.id) || s.writes.includes(obj.id))
    const active = selectedDataId === obj.id
    return el('article', {
      class: `data-card ${active ? 'active' : ''}`,
      onclick: () => { selectedDataId = obj.id; renderData() }
    }, [
      el('h3', {}, [obj.title]),
      el('code', {}, [obj.id]),
      el('p', {}, [obj.desc]),
      el('p', { html: `<b>产生：</b>${obj.producer}` }),
      el('p', { html: `<b>消费者：</b>${users.map(s => s.id).slice(0, 6).join(' / ')}${users.length > 6 ? ' ...' : ''}` }),
      el('div', { class: 'field-list' }, obj.fields.map(f => el('span', {}, [f])))
    ])
  }))
  const detail = document.getElementById('dataDetail')
  const obj = data.dataObjects.find(d => d.id === selectedDataId) || data.dataObjects[0]
  const readers = data.states.filter(s => s.reads.includes(obj.id))
  const writers = data.states.filter(s => s.writes.includes(obj.id))
  detail.replaceChildren(
    el('div', { class: 'detail-kicker' }, ['数据对象']),
    el('div', { class: 'detail-title' }, [obj.title]),
    el('code', {}, [obj.id]),
    el('p', {}, [obj.desc]),
    section('关键字段', listChips(obj.fields)),
    section('生产状态', listChips(writers.map(s => s.id), 'next')),
    section('消费状态', listChips(readers.map(s => s.id)))
  )
}

function renderRecovery() {
  const root = document.getElementById('recoveryGrid')
  root.replaceChildren(...data.recoveryRules.map(rule => el('article', { class: 'recovery-card' }, [
    el('div', { class: 'recovery-head' }, [
      el('div', {}, [el('h3', {}, [rule.source]), el('code', {}, [rule.stage])]),
      el('span', { class: `risk ${rule.risk}` }, [rule.risk])
    ]),
    el('div', { class: 'formula' }, [el('span', {}, [rule.status]), el('b', {}, ['→']), el('span', {}, [rule.action]), el('b', {}, ['→']), el('span', {}, [rule.next])]),
    el('p', {}, [rule.note]),
    el('div', { class: 'chips' }, [chip(`scene risk: ${rule.sceneRisk}`, rule.sceneRisk === 'high' ? 'fail' : 'recovery')])
  ])))
}

function renderScene() {
  const root = document.getElementById('sceneTimeline')
  const steps = data.states.filter(s => s.scene)
  root.replaceChildren(...steps.map(s => el('article', { class: 'scene-step' }, [
    el('h3', {}, [s.title]),
    el('code', {}, [s.stage]),
    el('p', {}, [s.desc]),
    el('div', { class: 'chips' }, [chip(s.id), ...s.failures.map(f => chip(f, 'fail'))])
  ])))
}

function renderMatrix() {
  const table = document.getElementById('matrixTable')
  const headers = ['state_id', 'stage', 'reads', 'writes', 'success', 'failure_status', 'recovery_action', 'next_state', 'slot', 'scene']
  const head = el('thead', {}, [el('tr', {}, headers.map(h => el('th', {}, [h])))])
  const body = el('tbody', {}, data.states.map(s => el('tr', {}, [
    el('td', {}, [s.id]), el('td', {}, [s.stage]), el('td', {}, [s.reads.join('\n')]), el('td', {}, [s.writes.join('\n')]),
    el('td', {}, [s.success]), el('td', {}, [s.failures.join('\n')]), el('td', {}, [s.recovery.join('\n')]),
    el('td', {}, [s.next.join('\n')]), el('td', {}, [s.slot ? 'true' : 'false']), el('td', {}, [s.scene ? 'true' : 'false'])
  ])))
  table.replaceChildren(head, body)
}

function renderAll() {
  renderLayerSwitch(); renderLegend(); renderFlow(); renderDetail(); renderData(); renderRecovery(); renderScene(); renderMatrix()
}

renderAll()
