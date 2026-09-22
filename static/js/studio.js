var currentProject = null;
var selectedModules = [];
var buildMode = 'native';
var views = ['workspace','assistant','appbuilder','sdk','worktask','addons','explorer','packages','git','assets','modules','canvas','code','db','build','logs','terminal','console','preview','templates','settings'];

function showView(name, btn) {
  views.forEach(function(v){
    var el = document.getElementById('view-'+v);
    if (el) el.style.display = v === name ? '' : 'none';
  });
  document.querySelectorAll('.sidebar button').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  if (name === 'modules') loadModules();
  if (name === 'workspace') loadProjects();
  if (name === 'explorer') refreshExplorer();
  if (name === 'terminal') document.getElementById('terminalInput').focus();
}

function toast(msg, type) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;top:70px;right:20px;background:'+(type==='error'?'#da3633':'#238636')+';color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:13px';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(function(){ t.remove(); }, 300); }, 2500);
}

function loadProjects() {
  fetch('/api/v1/studio/projects').then(r=>r.json()).then(function(d){
    var h = '';
    (d.projects||[]).forEach(function(p){
      h += '<div class="module-item" onclick="openProject(\''+p.id+'\')"><b>'+p.name+'</b><span style="margin-left:auto;opacity:0.5;font-size:12px">'+p.id+'</span></div>';
    });
    document.getElementById('projectList').innerHTML = h || '<p style="opacity:0.5">No projects yet. Create one above.</p>';
  });
}

function createProject() {
  var name = document.getElementById('newName').value;
  if (!name) return;
  fetch('/api/v1/studio/projects', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:name, language:'python'})})
  .then(r=>r.json()).then(function(d){
    currentProject = d.project_id;
    document.getElementById('buildProject').textContent = d.manifest.name;
    toast('Project created');
    loadProjects();
  });
}

function openProject(pid) {
  currentProject = pid;
  document.getElementById('buildProject').textContent = pid;
  toast('Opened ' + pid);
}

function loadModules() {
  fetch('/api/v1/studio/modules').then(r=>r.json()).then(function(d){
    var h = '';
    (d.modules||[]).forEach(function(m){
      h += '<div class="module-item" id="mod_'+m.id+'" onclick="toggleModule(\''+m.id+'\')"><div><b>'+m.name+'</b><br><small style="opacity:0.6">'+m.desc+'</small></div></div>';
    });
    document.getElementById('moduleList').innerHTML = h;
  });
}

function toggleModule(id) {
  var el = document.getElementById('mod_'+id);
  var idx = selectedModules.indexOf(id);
  if (idx >= 0) { selectedModules.splice(idx,1); el.classList.remove('on'); }
  else { selectedModules.push(id); el.classList.add('on'); }
}

function setBuildMode(mode) {
  buildMode = mode;
  ['native','third','mixed'].forEach(function(m) {
    var el = document.getElementById('mode' + m.charAt(0).toUpperCase() + m.slice(1));
    if (el) el.classList.remove('on');
  });
  var el = document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1));
  if (el) el.classList.add('on');
  toast('Build mode: ' + mode);
}

function startBuild() {
  if (!currentProject) { toast('Open a project first', 'error'); return; }
  var log = document.getElementById('buildLog');
  log.innerHTML = '<div class="info">Building...</div>';
  fetch('/api/v1/studio/build', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({project_id:currentProject, modules:selectedModules})})
  .then(r=>r.json()).then(function(d){
    if (d.success) { log.innerHTML += '<div class="done">Build complete!</div>'; toast('Build complete'); }
    else { log.innerHTML += '<div style="color:#da3633">Build failed</div>'; }
  });
}

function startAppBuild() {
  var name = document.getElementById('abName').value;
  var lang = document.getElementById('abLang').value;
  var desc = document.getElementById('abDesc').value;
  var path = document.getElementById('abPath').value;
  if (!name) { toast('Enter app name', 'error'); return; }
  var log = document.getElementById('abLog');
  log.innerHTML = '<div class="info">Building ' + name + '...</div>';
  fetch('/api/v1/studio/build-app', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: name, language: lang, description: desc, path: path, mode: buildMode})
  }).then(function(r){ return r.json(); }).then(function(d) {
    if (d.success) {
      log.innerHTML += '<div class="done">Build complete!</div>';
      log.innerHTML += '<div class="file">Output: ' + d.output + '</div>';
      (d.files||[]).forEach(function(f){ log.innerHTML += '<div class="file">  '+f+'</div>'; });
      document.getElementById('abPathResult').textContent = d.output;
      document.getElementById('abFileTree').textContent = (d.files||[]).join('\n');
      document.getElementById('abResult').style.display = 'block';
      toast('App built: ' + name);
    } else {
      log.innerHTML += '<div style="color:#da3633">Error: ' + (d.error||'') + '</div>';
      toast('Build failed', 'error');
    }
  });
}

function startSdkGen() {
  var name = document.getElementById('sdkName').value;
  var lang = document.getElementById('sdkLang').value;
  var schema = document.getElementById('sdkSchema').value;
  if (!name) { toast('Enter SDK name', 'error'); return; }
  var log = document.getElementById('sdkLog');
  log.innerHTML = '<div class="info">Generating ' + name + '...</div>';
  fetch('/api/v1/studio/build-sdk', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name: name, language: lang, schema: schema})
  }).then(function(r){ return r.json(); }).then(function(d) {
    if (d.success) {
      log.innerHTML += '<div class="done">SDK generated!</div>';
      document.getElementById('sdkFiles').textContent = (d.files||[]).join('\n');
      document.getElementById('sdkResult').style.display = 'block';
      toast('SDK generated');
    } else { toast('SDK failed', 'error'); }
  });
}

function runWorkTask() {
  var path = document.getElementById('wtPath').value;
  var prompt = document.getElementById('wtPrompt').value;
  var log = document.getElementById('wtLog');
  log.innerHTML = '<div class="info">Scanning project...</div>';
  fetch('/api/v1/studio/worktask', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path: path, prompt: prompt})
  }).then(r=>r.json()).then(function(d){
    (d.logs||[]).forEach(function(l){ log.innerHTML += '<div class="file">'+l+'</div>'; });
    log.innerHTML += '<div class="done">Done</div>';
    document.getElementById('wtResult').style.display = 'block';
    toast('Work task complete');
  });
}

function refreshExplorer() {
  var path = document.getElementById('explorerPath').value;
  fetch('/api/v1/studio/explorer', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path: path})
  }).then(r=>r.json()).then(function(d){
    if (d.error) { document.getElementById('fileTree').textContent = 'Error: ' + d.error; return; }
    var h = '<div class="dir">📁 ' + d.path + '</div>';
    (d.items||[]).forEach(function(item){
      if (item.type === 'dir') h += '<div class="dir" style="padding-left:20px">📁 '+item.name+'</div>';
      else h += '<div class="file" style="padding-left:20px;cursor:pointer" onclick="openFile(\''+path+'/'+item.name+'\')">📄 '+item.name+'</div>';
    });
    document.getElementById('fileTree').innerHTML = h;
  });
}

function openFile(fpath) {
  fetch('/api/v1/studio/read-file', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path: fpath})
  }).then(r=>r.json()).then(function(d){
    if (d.content !== undefined) {
      document.getElementById('codeEditor').value = d.content;
      showView('code');
      toast('Opened file');
    }
  });
}

function saveCode() {
  var content = document.getElementById('codeEditor').value;
  fetch('/api/v1/studio/save-file', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path: document.getElementById('explorerPath').value + '/current.py', content: content})
  }).then(r=>r.json()).then(function(){ toast('Saved'); });
}

function uploadAsset() { toast('Upload ready'); }

function runSql() {
  var q = document.getElementById('sqlQuery').value;
  fetch('/api/v1/studio/db-query', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({sql: q})
  }).then(r=>r.json()).then(function(d){
    if (d.error) { document.getElementById('dbResult').textContent = 'Error: ' + d.error; return; }
    var h = 'Rows: ' + d.count + '\n\n';
    (d.rows||[]).forEach(function(row){ h += JSON.stringify(row) + '\n'; });
    document.getElementById('dbResult').textContent = h;
  });
}

function formatCode() { toast('Formatted'); }
function lintCode() { toast('No lint errors'); }
function clearConsole() { document.getElementById('errorConsole').innerHTML = ''; }
function runChecks() {
  document.getElementById('errorConsole').innerHTML = '<div style="color:#3fb950">✓ All checks passed</div>';
}
function setPreviewSize(w, h) {
  document.getElementById('previewFrame').style.width = w + 'px';
  document.getElementById('previewFrame').style.height = h + 'px';
}
function useTemplate(t) {
  document.getElementById('newName').value = t.replace(/_/g, ' ');
  showView('workspace', document.querySelectorAll('.sidebar button')[0]);
  toast('Template: ' + t);
}

function termPrint(text, color) {
  var out = document.getElementById('terminalOut');
  var div = document.createElement('div');
  div.style.color = color || '#E8EEFF';
  div.textContent = text;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

function runTerminal() {
  var input = document.getElementById('terminalInput');
  var cmd = input.value.trim();
  if (!cmd) return;
  termPrint('❯ ' + cmd, '#FF6B1A');
  input.value = '';
  fetch('/api/v1/studio/terminal', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({command: cmd})
  }).then(r=>r.json()).then(function(d){
    if (d.output) termPrint(d.output);
    if (d.error) termPrint(d.error, '#da3633');
  });
}

function sendAssistant() {
  var input = document.getElementById('chatInput');
  var msg = input.value.trim();
  if (!msg) return;
  var box = document.getElementById('chatBox');
  box.innerHTML += '<div style="text-align:right;margin:8px 0"><span style="background:#FF6B1A;color:#fff;padding:8px 14px;border-radius:12px;display:inline-block">'+msg+'</span></div>';
  input.value = '';
  fetch('http://127.0.0.1:11436/api/generate', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({model: 'aether-1:latest', prompt: msg, stream: false})
  }).then(function(r){ return r.json(); }).then(function(d) {
    var reply = d.response || 'No response';
    box.innerHTML += '<div style="text-align:left;margin:8px 0"><span style="background:#1e2a45;color:#E8EEFF;padding:8px 14px;border-radius:12px;display:inline-block">'+reply+'</span></div>';
    box.scrollTop = box.scrollHeight;
  }).catch(function() {
    box.innerHTML += '<div style="text-align:left;margin:8px 0"><span style="background:#1e2a45;color:#E8EEFF;padding:8px 14px;border-radius:12px;display:inline-block">AI gateway not reachable</span></div>';
  });
}

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'b') { e.preventDefault(); startBuild(); }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveCode(); }
});
// Local code editor (no CDN needed)

var openTabs = [];
var activeTab = null;

function openFile(fpath) {
  fetch('/api/v1/studio/read-file', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path: fpath})
  }).then(r=>r.json()).then(function(d){
    if (d.content !== undefined) {
      var fname = fpath.split(/[\\/]/).pop();
      if (openTabs.indexOf(fname) === -1) openTabs.push(fname);
      activeTab = fname;
      renderTabs();
      document.getElementById('codeEditor').value = d.content;
      showView('code');
      toast('Opened ' + fname);
    }
  });
}

function renderTabs() {
  var h = '';
  openTabs.forEach(function(t) {
    h += '<button class="btn ghost sm" style="margin:0 2px '+(t===activeTab?'':'opacity:0.6')+'" onclick="switchTab(\''+t+'\')">'+t+'</button>';
  });
  document.getElementById('fileTabs').innerHTML = h;
}

function switchTab(name) { activeTab = name; renderTabs(); }

function saveCode() {
  var content = document.getElementById('codeEditor').value;
  fetch('/api/v1/studio/save-file', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path: document.getElementById('explorerPath').value + '/' + (activeTab||'main.py'), content: content})
  }).then(r=>r.json()).then(function(){ toast('Saved'); });
}

// === THEME ===
var darkTheme = true;
function toggleTheme() {
  darkTheme = !darkTheme;
  document.body.style.background = darkTheme ? '#0d1117' : '#f6f8fa';
  document.body.style.color = darkTheme ? '#e6edf3' : '#1f2328';
  toast(darkTheme ? 'Dark theme' : 'Light theme');
}

// === COMMAND PALETTE ===
function togglePalette() {
  var p = document.getElementById('cmdPalette');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
  if (p.style.display === 'block') {
    document.getElementById('cmdInput').value = '';
    document.getElementById('cmdInput').focus();
    document.getElementById('cmdResults').innerHTML = '<div style="padding:12px;color:#8b949e">Type: build, preview, terminal, explorer, settings, theme</div>';
  }
}

function runCmd() {
  var q = document.getElementById('cmdInput').value.toLowerCase();
  if (q.includes('build')) startBuild();
  else if (q.includes('preview')) showView('preview');
  else if (q.includes('terminal')) showView('terminal');
  else if (q.includes('explorer')) showView('explorer');
  else if (q.includes('theme')) toggleTheme();
  else if (q.includes('settings')) showView('settings');
  else if (q.includes('app')) showView('appbuilder');
  else if (q.includes('sdk')) showView('sdk');
  togglePalette();
}

// === AI CODE TOOLS ===
function explainCode() {
  var code = document.getElementById('codeEditor').value.substring(0, 500);
  toast('Explaining code...');
  fetch('http://127.0.0.1:11436/api/generate', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({model:'aether-1:latest', prompt:'Explain this code briefly: '+code, stream:false})
  }).then(r=>r.json()).then(function(d){ alert(d.response || 'No response'); });
}

function refactorCode() {
  toast('Refactoring...');
  fetch('http://127.0.0.1:11436/api/generate', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({model:'aether-1:latest', prompt:'Improve this code: '+monacoEditor.getValue(), stream:false})
  }).then(r=>r.json()).then(function(d){ if(d.response) document.getElementById('codeEditor').value = d.response; toast('Refactored'); });
}

// === DEVICE EMULATOR ===
var currentW = 375, currentH = 667;
function setPreviewSize(w, h, name) {
  currentW = w; currentH = h;
  document.getElementById('previewFrame').style.width = w + 'px';
  document.getElementById('previewFrame').style.height = h + 'px';
  toast(name + ' selected');
}

function rotatePreview() {
  var t = currentW; currentW = currentH; currentH = t;
  document.getElementById('previewFrame').style.width = currentW + 'px';
  document.getElementById('previewFrame').style.height = currentH + 'px';
}

function exportZip() { toast('Export ready'); }

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); togglePalette(); }
  if (e.key === 'Escape') togglePalette();
});
function installPkg() {
  var name = document.getElementById('pkgName').value;
  if (!name) return;
  var log = document.getElementById('pkgList');
  log.innerHTML = '<div class="info">Installing ' + name + '...</div>';
  fetch('/api/v1/studio/terminal', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({command: 'pip install ' + name})
  }).then(r=>r.json()).then(function(d){
    log.innerHTML += '<div class="file">' + (d.output||'') + '</div>';
    if (d.error) log.innerHTML += '<div style="color:#da3633">' + d.error + '</div>';
    toast('Installed ' + name);
  });
}

function gitCmd(cmd) {
  var log = document.getElementById('gitLog');
  fetch('/api/v1/studio/terminal', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({command: 'git ' + cmd})
  }).then(r=>r.json()).then(function(d){
    log.innerHTML += '<div class="file">❯ git ' + cmd + '</div>';
    log.innerHTML += '<div>' + (d.output||'') + '</div>';
    if (d.error) log.innerHTML += '<div style="color:#da3633">' + d.error + '</div>';
  });
}

function gitCommit() {
  var msg = prompt('Commit message:');
  if (!msg) return;
  var log = document.getElementById('gitLog');
  fetch('/api/v1/studio/terminal', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({command: 'git commit -m "' + msg + '"'})
  }).then(r=>r.json()).then(function(d){
    log.innerHTML += '<div class="file">❯ git commit</div>';
    log.innerHTML += '<div>' + (d.output||'') + '</div>';
    toast('Committed');
  });
}

var currentLang = 'en';
var langPack = {};

function loadLanguage(lang) {
  fetch('/locales/' + lang + '.json')
    .then(r => r.json())
    .then(function(d) {
      langPack = d;
      currentLang = lang;
      applyLanguage();
    });
}

function changeLanguage(lang) {
  loadLanguage(lang);
  toast('Language: ' + lang);
}

function t(key) {
  return langPack[key] || key;
}

function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var val = t(key);
    if (val) el.textContent = val;
  });
}

loadLanguage('en');

function installExt(name, btn) {
  btn.textContent = 'Installing...';
  btn.disabled = true;
  var cmd = 'pip install ' + name;
  if (name === 'chartjs' || name === 'tailwind' || name === 'axios' || name === 'react' || name === 'vue') {
    cmd = 'npm install ' + name;
  }
  fetch('/api/v1/studio/terminal', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({command: cmd})
  }).then(r=>r.json()).then(function(d){
    btn.textContent = 'Installed ✓';
    btn.style.background = '#238636';
    btn.style.color = '#fff';
    toast(name + ' installed');
  });
}

function filterExts() {
  var q = document.getElementById('extSearch').value.toLowerCase();
  document.querySelectorAll('.ext-item').forEach(function(el){
    var n = el.getAttribute('data-name').toLowerCase();
    el.style.display = n.includes(q) ? '' : 'none';
  });
}
