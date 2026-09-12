/*
 * Connect brief builder — reproduces the exact branded design from a content JSON.
 * Usage:  node build.js <content.json> <daily|weekly>
 * Output: out/<name>.docx   (then convert to PDF with make.sh)
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType, ExternalHyperlink,
  Footer, PageNumber, TabStopType, HeightRule
} = require('docx');

const contentPath = process.argv[2] || 'content_daily.json';
const type = (process.argv[3] || 'daily').toLowerCase();
const C = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const A = path.join(__dirname, 'assets');

// Brand
const PURPLE='3B2176', MAGENTA='E5298E', INDIGO='534AB7', AMBER='F6B642',
      CORAL='D85A30', TEAL='1D9E75', GREY='5A5566', DARK='241540';
const LILAC='F1ECFA', JFILL='EBEAF8', DFILL='E4F3EC', CFILL='FBF3E6', MFILL='FCE7F1';
const HEAD='Josefin Sans', BODY='Inter';
const COLORS={purple:PURPLE,magenta:MAGENTA,indigo:INDIGO,amber:AMBER,coral:CORAL,teal:TEAL,grey:GREY};
const col=(n)=>COLORS[(n||'').toLowerCase()]||PURPLE;

const logo = fs.readFileSync(path.join(A,'MapsLogo.jpg'));
const connect = fs.readFileSync(path.join(A,'CONNECT_ICON_HR.png'));
let curAccent = MAGENTA;
const noB={style:BorderStyle.NONE,size:0,color:'FFFFFF'};
const noBorders={top:noB,bottom:noB,left:noB,right:noB,insideHorizontal:noB,insideVertical:noB};

function link(label,url){return new ExternalHyperlink({link:url,children:[new TextRun({text:label,style:'Hyperlink',font:BODY,size:17,color:INDIGO})]});}
function item(lede,body,srcLabel,srcUrl){
  const c=[new TextRun({text:'\u25AA  ',font:BODY,size:15,color:curAccent})];
  if(lede)c.push(new TextRun({text:lede+'  ',bold:true,font:BODY,size:19,color:DARK}));
  if(body)c.push(new TextRun({text:body+' ',font:BODY,size:19,color:'2E2740'}));
  if(srcLabel){c.push(new TextRun({text:'(',font:BODY,size:17,color:GREY}));c.push(link(srcLabel,srcUrl));c.push(new TextRun({text:')',font:BODY,size:17,color:GREY}));}
  return new Paragraph({children:c,spacing:{after:60,line:264},indent:{left:200}});
}
function actionLine(text){
  return new Paragraph({indent:{left:340},spacing:{after:150,line:250},children:[
    new TextRun({text:'\u2192 For your school:  ',bold:true,font:BODY,size:17,color:MAGENTA}),
    new TextRun({text:text,font:BODY,size:17,italics:true,color:'4A4360'})]});
}
function bullet(runs,after=90){return new Paragraph({children:runs,bullet:{level:0},spacing:{after,line:258}});}
function sectionHeading(text,color){curAccent=color;
  return new Paragraph({spacing:{before:230,after:100},border:{bottom:{style:BorderStyle.SINGLE,size:10,color,space:4}},
    children:[new TextRun({text:'\u25A0  ',font:HEAD,size:22,color}),new TextRun({text:text.toUpperCase(),font:HEAD,bold:true,size:24,color,characterSpacing:20})]});}
function p(runs,opts={}){return new Paragraph({children:runs,spacing:{after:opts.after??70,line:258},...opts});}
function box(label,accent,fill,contentParas){
  return new Table({width:{size:9360,type:WidthType.DXA},columnWidths:[9360],
    borders:{top:noB,bottom:noB,right:noB,left:{style:BorderStyle.SINGLE,size:24,color:accent,space:0}},
    rows:[new TableRow({children:[new TableCell({width:{size:9360,type:WidthType.DXA},
      shading:{type:ShadingType.CLEAR,fill,color:'auto'},margins:{top:140,bottom:130,left:220,right:200},
      borders:{top:noB,bottom:noB,right:noB,left:{style:BorderStyle.SINGLE,size:24,color:accent,space:0}},
      children:[new Paragraph({spacing:{after:90},children:[new TextRun({text:label.toUpperCase(),font:HEAD,bold:true,size:19,color:accent,characterSpacing:26})]}),...contentParas]})]})]});
}

const children=[];

// Masthead
children.push(new Table({width:{size:9360,type:WidthType.DXA},columnWidths:[1180,4320,3860],borders:noBorders,
  rows:[new TableRow({children:[
    new TableCell({width:{size:1180,type:WidthType.DXA},borders:noBorders,verticalAlign:'center',
      children:[new Paragraph({children:[new ImageRun({type:'png',data:connect,transformation:{width:88,height:88}})]})]}),
    new TableCell({width:{size:4320,type:WidthType.DXA},borders:noBorders,verticalAlign:'center',children:[
      new Paragraph({spacing:{after:0},children:[new TextRun({text:type==='weekly'?'CONNECT WEEKLY':'CONNECT DAILY',font:HEAD,bold:true,size:38,color:PURPLE,characterSpacing:20})]})]}),
    new TableCell({width:{size:3860,type:WidthType.DXA},borders:noBorders,verticalAlign:'center',children:[
      new Paragraph({alignment:AlignmentType.RIGHT,spacing:{after:60},children:[
        new ImageRun({type:'jpg',data:logo,transformation:{width:108,height:41}})]}),
      new Paragraph({alignment:AlignmentType.RIGHT,spacing:{after:0},children:[
        new TextRun({text:C.edition||'',font:BODY,size:16,bold:true,color:INDIGO}),
        new TextRun({text:(C.edition?'   \u00B7   ':'')+C.date,font:BODY,size:18,color:GREY,bold:true})]}),
      new Paragraph({alignment:AlignmentType.RIGHT,spacing:{before:20},children:[link('themapsproject.com','https://www.themapsproject.com')]})]}),
  ]})]}));
const BAND=[PURPLE,MAGENTA,INDIGO,AMBER,CORAL,TEAL,GREY];
const bandW=Math.floor(9360/BAND.length);
children.push(new Paragraph({spacing:{before:60,after:0},children:[new TextRun({text:''})]}));
children.push(new Table({width:{size:9360,type:WidthType.DXA},columnWidths:BAND.map(()=>bandW),borders:noBorders,
  rows:[new TableRow({height:{value:40,rule:HeightRule.EXACT},children:BAND.map(c=>new TableCell({width:{size:bandW,type:WidthType.DXA},borders:noBorders,
    shading:{type:ShadingType.CLEAR,fill:c,color:'auto'},margins:{top:0,bottom:0,left:0,right:0},
    children:[new Paragraph({spacing:{before:0,after:0},children:[new TextRun({text:'',size:2})]})]}))})]}));
children.push(new Paragraph({spacing:{after:150},children:[new TextRun({text:''})]}));

const standfirst = C.standfirst || (type==='weekly'
  ? 'A weekly review of national and South Yorkshire developments in education policy, inclusion, SEND, behaviour and accountability \u2014 weighted to primary and evidence sources, with links and a clear \u201Cso what for your school\u201D line on the items that matter.'
  : 'A daily scan of national and South Yorkshire developments in education policy, inclusion, SEND, behaviour and accountability \u2014 weighted to primary and evidence sources, with links and a clear \u201Cso what for your school\u201D line on the items that matter.');
children.push(new Paragraph({spacing:{after:40},children:[new TextRun({text:standfirst,italics:true,font:BODY,size:18,color:GREY})]}));
children.push(new Paragraph({spacing:{after:180},children:[
  new TextRun({text:'Useful? Forward it to a colleague. ',font:BODY,size:16,color:INDIGO}),
  new TextRun({text:'To join the circulation or partner with the network, ',font:BODY,size:16,color:GREY}),
  link('get in touch','https://www.themapsproject.com/contact-us'),new TextRun({text:'.',font:BODY,size:16,color:GREY})]}));

// Top line
if(C.topline&&C.topline.length){
  const paras=[];
  C.topline.forEach(t=>{paras.push(bullet([new TextRun({text:t.text,font:BODY,size:19,color:DARK})],40));
    if(t.action)paras.push(actionLine(t.action));});
  children.push(box('Top line',MAGENTA,LILAC,paras));
}

// Diary
if(C.diary&&C.diary.length){
  const dl=(d)=>new Paragraph({spacing:{after:60,line:252},children:[
    new TextRun({text:d.date+'   ',bold:true,font:BODY,size:17,color:col(d.color)}),
    new TextRun({text:'\u2014  '+d.text,font:BODY,size:17,color:'2E2740'})]});
  children.push(box('Dates for the diary',PURPLE,LILAC,C.diary.map(dl)));
}

// Rotating box renderer
function rotating(bx){
  if(!bx)return null;
  if(bx.type==='datapoint')return box(bx.label||'Data point of the week',TEAL,DFILL,[
    p([new TextRun({text:bx.big||'',bold:true,font:HEAD,size:40,color:TEAL})],{after:20}),
    p([new TextRun({text:bx.text||'',font:BODY,size:19,color:'2E2740'})],{after:40}),
    p([new TextRun({text:bx.attribution||'',font:BODY,size:16,italics:true,color:GREY})],{after:0})]);
  if(bx.type==='jargon')return box(bx.label||'Jargon-buster',INDIGO,JFILL,[
    p([new TextRun({text:bx.intro||'',font:BODY,size:18,color:'2E2740'})],{after:70}),
    p([new TextRun({text:bx.text||'',font:BODY,size:18,color:'2E2740'})],{after:0})]);
  if(bx.type==='corridor')return box(bx.label||'From the corridor',AMBER,CFILL,[
    p([new TextRun({text:bx.quote||'',italics:true,font:BODY,size:19,color:'2E2740'})],{after:60}),
    p([new TextRun({text:bx.author||'',font:BODY,size:16,color:GREY})],{after:0})]);
  return null;
}

// Sections
(C.sections||[]).forEach(sec=>{
  children.push(sectionHeading(sec.heading,col(sec.color)));
  (sec.items||[]).forEach(it=>{
    children.push(item(it.lede,it.body,it.source,it.url));
    if(it.action)children.push(actionLine(it.action));
  });
});

// Rotating box + MAPs-in-practice (static promo)
const rb=rotating(C.box); if(rb)children.push(rb);
children.push(box('MAPs in practice \u2014 tool spotlight: School+',MAGENTA,MFILL,[
  p([new TextRun({text:C.spotlightIntro||'A strong inclusion strategy is only as good as the cohort picture beneath it.',font:BODY,size:19,color:'2E2740'})],{after:70}),
  p([new TextRun({text:'School+ ',bold:true,font:BODY,size:19,color:MAGENTA}),
     new TextRun({text:'is the MAPs cohort-vulnerability framework \u2014 it maps who your at-risk pupils are and why, giving your inclusion strategy an evidence base rather than a wish list. ',font:BODY,size:19,color:'2E2740'}),
     link('Explore School+','https://www.themapsproject.com')],{after:0})]));

// Sources table (static)
children.push(sectionHeading('Sources monitored',PURPLE));
children.push(new Paragraph({spacing:{after:130},children:[new TextRun({text:'Weighted official- and evidence-first. X is monitored for early signals from official accounts and named commentators, and corroborated against a primary source before anything is included.',font:BODY,size:17,italics:true,color:GREY})]}));
const thinB={style:BorderStyle.SINGLE,size:4,color:'D8D2E4'};const cB={top:thinB,bottom:thinB,left:thinB,right:thinB};
const W1=2900,W2=2100,W3=4360;
const hCell=(t,w)=>new TableCell({width:{size:w,type:WidthType.DXA},borders:cB,shading:{type:ShadingType.CLEAR,fill:PURPLE,color:'auto'},margins:{top:60,bottom:60,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:t,bold:true,font:HEAD,size:18,color:'FFFFFF'})]})]});
const catCell=(t)=>new TableCell({width:{size:9360,type:WidthType.DXA},borders:cB,shading:{type:ShadingType.CLEAR,fill:LILAC,color:'auto'},columnSpan:3,margins:{top:50,bottom:50,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:t.toUpperCase(),bold:true,font:HEAD,size:16,color:PURPLE,characterSpacing:20})]})]});
const srcCell=(l,u,w)=>new TableCell({width:{size:w,type:WidthType.DXA},borders:cB,margins:{top:50,bottom:50,left:120,right:120},children:[new Paragraph({children:u?[link(l,u)]:[new TextRun({text:l,font:BODY,size:17,color:DARK})]})]});
const txtCell=(t,w)=>new TableCell({width:{size:w,type:WidthType.DXA},borders:cB,margins:{top:50,bottom:50,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:t,font:BODY,size:16,color:'2E2740'})]})]});
const rows=[new TableRow({tableHeader:true,children:[hCell('Source',W1),hCell('Type',W2),hCell('What we track',W3)]})];
const cat=(n)=>rows.push(new TableRow({children:[catCell(n)]}));
const row=(l,u,t,w)=>rows.push(new TableRow({children:[srcCell(l,u,W1),txtCell(t,W2),txtCell(w,W3)]}));
cat('Official & statutory');
row('DfE / GOV.UK','https://www.gov.uk/government/organisations/department-for-education','Government','Policy, funding, statutory guidance and statistics');
row('Ofsted','https://www.gov.uk/government/organisations/ofsted','Government','Inspection framework, report cards, annual report');
row('Explore Education Statistics','https://explore-education-statistics.service.gov.uk/','Government data','Exclusions, suspensions, attendance, census data');
row('House of Commons Library','https://commonslibrary.parliament.uk/','Parliament','Neutral briefings on bills and policy');
cat('Research & evidence');
row('Education Endowment Foundation','https://educationendowmentfoundation.org.uk/','Research','Evidence-based guidance, incl. inclusive teaching');
row('NFER','https://www.nfer.ac.uk/','Research','Assessment, workforce, disadvantage');
row('Education Policy Institute','https://epi.org.uk/','Think tank','Policy analysis and the disadvantage gap');
row('Institute for Fiscal Studies','https://ifs.org.uk/','Think tank','School funding and spending analysis');
row('FFT Education Datalab','https://ffteducationdatalab.org.uk/','Data analysis','Data-driven analysis of attainment and exclusions');
cat('Inclusion & prevention specialists');
row('The Difference','https://the-difference.com/','Charity','Whole-school inclusion; \u201CWho\u2019s Losing Learning?\u201D');
row('IPPR','https://www.ippr.org/','Think tank','Lost learning, exclusions, SEND reform');
row('Youth Endowment Fund','https://youthendowmentfund.org.uk/','Research','What works to prevent youth violence & exclusion');
row('Centre for Social Justice','https://www.centreforsocialjustice.org.uk/','Think tank','Exclusion tracker and social-mobility policy');
row('Whole School SEND','https://www.wholeschoolsend.org.uk/','Network','SEND practice, resources and reviews');
cat('Sector press & commentary');
row('Schools Week','https://schoolsweek.co.uk/','Press','Breaking sector news and investigations');
row('Tes','https://www.tes.com/magazine','Press','Practice, policy and workforce');
row('The Guardian (Education)','https://www.theguardian.com/education','Press','National coverage and comment');
row('X (monitored)',null,'Social','DfE, Ofsted, EEF and named voices \u2014 corroborated before use');
cat('Local & regional');
row('The Star (Sheffield)','https://www.thestar.co.uk/education','Local press','Local schools and Ofsted outcomes');
row('Sheffield City Council','https://www.sheffield.gov.uk/','Local government','Council decisions, funding and local strategy');
row('South Yorkshire MCA & Careers Hub',null,'Regional','Regional skills, careers and funding');
children.push(new Table({width:{size:9360,type:WidthType.DXA},columnWidths:[W1,W2,W3],borders:cB,rows}));

// Footer
children.push(new Paragraph({spacing:{before:280,after:40},border:{top:{style:BorderStyle.SINGLE,size:12,color:PURPLE,space:6}},children:[
  new TextRun({text:type==='weekly'?'Connect Weekly':'Connect Daily',bold:true,font:HEAD,size:17,color:PURPLE}),
  new TextRun({text:' is part of Sheffield Connect. Compiled by Andy Marsden, Sector Inclusion Lead.',font:BODY,size:16,color:GREY})]}));
children.push(new Paragraph({spacing:{before:20},children:[new TextRun({text:'For circulation across the network and partners. Figures reflect the latest published data at the date of this brief.',font:BODY,size:15,italics:true,color:'8A8496'})]}));

const runningName=(type==='weekly'?'Connect Weekly':'Connect Daily')+(C.edition?' \u00B7 '+C.edition:'')+' \u00B7 '+C.date;
const doc=new Document({creator:'MAPs Project',title:(type==='weekly'?'Connect Weekly':'Connect Daily')+' \u2014 '+C.date,
  styles:{default:{document:{run:{font:BODY,size:19,color:'2E2740'}}},paragraphStyles:[{id:'Hyperlink',name:'Hyperlink',run:{color:INDIGO,underline:{}}}]},
  sections:[{properties:{page:{margin:{top:900,bottom:1080,left:1080,right:1080}}},
    footers:{default:new Footer({children:[new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:6,color:'D8D2E4',space:6}},tabStops:[{type:TabStopType.RIGHT,position:9360}],children:[
      new TextRun({text:runningName,font:BODY,size:15,color:GREY}),new TextRun({text:'\t',font:BODY,size:15}),
      new TextRun({text:'Page ',font:BODY,size:15,color:GREY}),new TextRun({children:[PageNumber.CURRENT],font:BODY,size:15,color:GREY}),
      new TextRun({text:' of ',font:BODY,size:15,color:GREY}),new TextRun({children:[PageNumber.TOTAL_PAGES],font:BODY,size:15,color:GREY})]})]})},
    children}]});

const safe=(type==='weekly'?'Connect_Weekly':'Connect_Daily')+'_'+(C.date||'').replace(/[^A-Za-z0-9]+/g,'_');
const outPath=path.join(__dirname,'out',safe+'.docx');
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(outPath,b);console.log(outPath);});
