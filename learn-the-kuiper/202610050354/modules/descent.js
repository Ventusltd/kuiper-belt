// descent.js  SEE THROUGH, a LEARN THE KUIPER module (id 'descent').
// See through the universe to one substation: one unbroken fall from the Kuiper star field, through the grid the stars
// gather into, down a round porthole to one real substation, with the real map and real satellite imagery showing through.
//   Stars:        every place from KuiperLaw.place (kuiper-law.js), keys as DRAW THE GRID gives them (grid.js keyOf).
//   Substations:  modules/grid-data.js names (OpenStreetMap, ODbL) plus the table below (lon, lat, voltage, operator)
//                 from the same public file, globalgrid2050.com/grid_substations.geojson. Built by descent/build_descent_data.py.
//   Lines (GRID): grid-data.js 400 kV and 132 kV networks (OpenStreetMap, ODbL), each frame fitted back to lon/lat.
//   Real map:     exactly what GridAtlas uses (see descent/DESCENT-MAP.md): MapLibre GL 3.6.2 from jsDelivr, the CARTO
//                 dark-matter style, Esri World Imagery for satellite, GridAtlas's own 400/275/132 kV line files.
//                 Network only; the module opens and works offline from file:// without it.
// A star is a line of code today, not a substation. The stars gather into the grid; they do not address it.
(function () {
  'use strict';
  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || '';
  var SUB = /*DATA-BEGIN*/{"n":5800,"lon":"3h5v,-tlv,-9nvn,-avw,-27x8,a6i3,2,-b7i1,65ki,-eoq,a1a,-40st,-332,t4,-2hox,41t,-48o,d0,-ef6,8y,14k7,-88d,384,-h9r,12w,7mp,-9hf,-4rn,2bdu,-n49,-11m,6kg,-75l,uzu,-uya,axn,bzr,-6xz,8m5,-dyf,-7uo,m1y,-jgg,2s2,-1bgw,1ixi,-1h2y,10s6,xpt,s81,4bs,-asb,-1dp,-1tgb,17zp,-1fyu,-8d8,wzk,e1,qq7,w6s,-2eqz,y3t,-1lq,168o,ce,-299w,zah,17hd,cix,-2iaj,5dr,rb0,1hvm,1i1,-1xv6,-uo0,1bje,1ags,-2kwp,14gj,1f6n,xpw,pxe,4k0,4pi,-13nn,1pjh,-1ft4,xyh,-8d0,54c,6m5,-2wo,-13u2,10di,-8io,y5b,-zdv,49r,1d6,-u35,5c5,j3q,2hl,-rro,13wt,-1g4w,14gx,-2wq,4pz,-2kaw,2rry,-15e6,10fy,-27lo,17wu,1qok,-haw,-2y0r,1xpc,-1pop,-21eo,5iyl,8pg,-5hma,1t6a,1fj7,20cq,-24dk,-zmy,1ie6,-3zl9,4vwx,-195e,-goz,-678,-25nh,-pl2,206c,-2509,29np,-22ip,2411,-j2b,r2t,-1hix,iu5,-1btq,220a,-ejj,1j4b,j7g,2507,-s3b,6rb,22p,3g1z,5lf,-ccq,-2lct,3570,-17e,-2o,3h4,1lw,-1xcf,1xnq,-50k,13ep,-1woh,1nls,-87bs,mdg,qfd,-prv,1py,805t,-3doi,-n4l,-4cef,3r4w,-28mo,2aym,2en7,-7lq,1zp3,-27ms,1wlm,ad7,-dge,bkl,1r4,15py,-2xok,1s1z,-2e25,-3i5s,6bhy,-32hf,-1pn,l8c,-m8b,32f2,-67qd,htm,-q4q,3iqn,3123,-1z3,p3c,-1q68,jw,1i,-9qx,q4,js,fn2,-1n7t,1myq,1xp,17q,7jg,-fik,-20m,17a,-21w,-311,4rg,br1,ftq,-4oe,5tq,-t0,97j,-2rbf,hcb,1lci,-1utj,-qq,-1efs,1h7w,-43e3,ccn,-apg,4bm9,-yxa,16n,2mcp,-2dh2,-1cr,-db,3ldo,-3mhs,8wm,-est,-2hf,-170,nkk,-yvx,545,1nv6,-2l5t,-96,54mb,-3nb,-2c1z,-5rip,4p6,7nne,-9poi,92n8,-6nt,47o,19,kgf,-4sj1,-3f7j,3v7v,-2nml,4el0,-4pnf,7ny,2xeb,-ab4p,9k52,dw0,-38wh,a21e,-2cjf,-5uva,6o8c,1h1w,-8bfl,-ug,74bo,27c,-vhf,-89j6,auc8,-5oug,-3e5y,2afc,3g7a,-5er1,5f0,1f34,1v8u,-20cl,-2a1y,9fho,-f1i2,evbc,-9ps2,4snc,50jt,-9f9d,9d20,-qc2,-1lo7,-4033,1j4g,-1lyc,-elg,1uf3,-6adi,80ar,3cro,-v58,-5vw1,33fz,n4m,-450h,-1vqe,-2tpe,4v0s,-4ghz,9h7o,-5az6,rdd,-1qyg,6d0y,-7wsn,9bf,dma,9e01,-50r9,-4ab8,-m,a05w,-38pe,-979,-37yo,5vqu,-5jzg,5ywz,-ados,6hzh,-25j7,-29a8,-2g4q,6360,543,87k,-ust,12nl,-rxt,-58h2,561m,1xwz,-3n0b,-314p,-1ti,2s3,jtj,-omj,13s,23r,3r5m,-9sb,-66ea,3s9p,-1bpr,2f3r,36et,-7j0r,8vnv,-6nur,-9l,3rbv,po7,2ynq,-4qty,34d5,83,-3bol,-1gko,-5ac6,5yuf,-82lc,9bae,-1bfu,177,406,-18a,4kwl,-6r1,-6obc,3rft,-c1,-4buk,2j0z,-14eu,14me,1ojo,2vly,-53t3,-1dgw,6ilt,-z6n,-2efa,dh5,-jyw,2nuq,-bj,cqh,-1x93,59t9,-75md,-1nqk,1kgf,-4u1q,6az7,6vn,-vjg,-2xg7,-1rhr,6btv,-15ct,-jrr,1i8,d2g,fe8,-4u5t,3yw4,-3t6h,864j,-h10,-3o25,wnh,1e62,-1t4t,-31yb,4pi,-xy,ax2,17ch,t27,36c7,-8iwz,f1i,65ek,1ahn,-20nk,-xc5,32n,-9jo,-23e9,36ti,c68,2mzg,-4m2p,7jc3,-5t,-7c3g,3ydi,o1,-jit,-mw9,b1b,-3lz0,1z3y,-5ta,-2quo,-2v4l,30zi,-2ywj,76ec,-1d0a,2rwx,-2jjl,-3j7v,-3mrw,87w4,-73kl,-d7g,85ex,-23l1,14es,-61dq,b2,-b2a,1pii,1o6,4bo6,-4pf8,-lp2,vlh,3sjm,-4jn8,3t4b,1fio,-16l2,1mdd,-2r5,5i5l,-34r,36z,-4jwg,-1aih,jt,-ihm,-bz3,6mj,-1k,-6dq,j03,6vu,-e,ctk,uf,-dtm,-hqx,y2s,-5u2s,68nb,-kl,vo,-3t,3g0a,-qy4,-3s7,-24bm,-27,-880h,6b9p,-6spc,bpvj,-4r4,-1zwj,-9ryf,8x7,216z,avm0,-17v1,73d,lnn,-1gv5,-1nif,1nfn,5ks,-dd0,-4158,2cuy,4hm,2ddb,-5bw6,1bm,28nn,vc,-26kk,4rvb,-5ot5,3w,12jx,-5b,sm0,-b1y,113z,-iga,bct,-2eki,1ks1,-1qfy,7vt,-911,-3f7,1rhn,-2ikv,-164,ik0,4fk,3ix,-4mu,1ntw,-wuu,-dya,-2t5,1hl7,1r74,-bgh,5ja,15w0,-7hhj,ehc,2zz7,6k52,-455u,3cpb,2hn,-7k0,-3jn7,-3eb,-6nhs,3df0,-wne,213c,-crb,rg6,55vy,-4whq,-17pp,-1ek,7hzi,-8rri,3je7,4wpz,-4kon,-1tzp,43k,6jt,7nd,5wai,-8d0h,-6u,27w1,32c,-1omg,-o4c,kk,-j2l,1z2c,4o1k,-27r0,-5yjd,-90g,96n,7n1,1bcm,35li,-kn8,-3jyp,14r7,-v4,1af6,7lpu,dz6,-93z8,a88,-eux,-bv8,2d1r,23b,ksj,2pc3,-kbr,-1e2d,-4rnz,9tws,vpi,-5oez,5epg,-98x,-1qms,-6pcs,1npj,1vpj,-3do,-24hk,8r,-c3n,34ep,-4tqh,fc1,5nif,382,-lms,-3ed5,7atk,-5hne,-6b5,1785,-16j5,-3b95,-27bf,9i0j,1jkq,-3rps,l48,-9j39,942b,-8st3,acvf,-9jb9,kx8,-p6l,752a,142u,2lln,-b8i,3zf,hih,-5s6,-atl,11q,-2jaq,4cy,1w,9w,2vq0,-bv,7d,-51w0,4h9p,-4cf,-43ww,4p6,28hg,w3w,-yub,-d0d,1897,-qze,-269q,1y1w,-60ol,55xo,17uj,-2dv8,-49s3,4806,380l,-3im,-7pqh,-1f0s,9cc3,-s7u,-4gqc,7s,-3bga,7trl,q1d,-18k9,-2ah2,3ef1,-790n,3z0k,-1yij,5pc0,18b,-5mpf,63e3,-9l1,-1ab,3xn,-7xl6,-9xy,3wqq,4a8y,bki,-5syt,-k70,-2h,-flp,7sfi,-5r8,-in2,-4nn3,-293f,2dnv,5f2k,-32sn,-2uxy,68fg,-tgh,-99xr,kq9,1o5s,3jpk,2gz1,qr,-3wl7,4hjk,-4ivm,4n9y,-1tzl,-371s,-pfd,3tl8,251q,-928z,343v,-2owv,428q,3fzg,4pp,n4u,-5mw,-2v85,-17ha,58km,2ux,-c9t,-obh,-avgc,e3,c6fh,39y,-8wq4,8v6j,2k7,-857,-5s7l,4s5w,-aunz,amc0,f2,tw,-3ykf,-61pq,61pa,-2dnb,6bjm,-4uf3,2gw7,-8oa,-1z9m,4lks,-2188,-7ile,-6mg,51yy,46r9,-7eqv,17sk,-2bqa,-16ja,cyv,7zsp,-1en3,1fpv,-anb,-gl2,3e9m,-3ztj,2q98,-7yv5,3lhu,ugl,-4tpf,2m27,27aa,-7pro,3v8y,3ny8,-7m6,qi,-21sp,24z6,5,-g4w,-2hf,lq9,-1byz,yqh,zc,-4rnh,-j2h,5tns,4t7o,-b2e4,5mj5,-50,2f,-3f3z,2j4e,-4kmj,-nx,58ph,-7lah,ambh,-58wb,33rw,-6g3g,7u3,-9xg,c4m,5leg,-5x61,sne,-18tg,5kju,66j,-611c,21bu,2j9z,-4ahz,92q2,-82w2,41s9,-3ma1,-8q,-r8h,-5rq,-47j,p5i,9vnp,-8btq,82ee,-1ts7,-8gmm,-om,1iva,4aj1,3z9i,dun,15fl,-aqci,4pf0,g33,-4so9,96q4,-o3k,-8dix,52ty,-1c,-41xw,za6,324v,-5oxc,1ubl,3kcr,-2r9r,-dn6,-tb,-2o1,-15k,-13ey,1pz0,6lr,265z,-1k73,-8lp,-4mge,6c53,-lrd,1u,-49he,51ep,-2fjb,-hvg,-2nyd,-o7l,3tfm,5qba,-3jpf,8fr,-2gs4,c9o,jey,58s5,-44ey,-28p3,1ks8,-vj2,-n3,1gvg,-5jue,4l5c,-2sz0,8b2m,-70zk,-2ygq,2o6,fw5,4yfa,-tj,19p7,-3730,-38kc,2snp,6tzn,-72dn,6ruo,-3isw,-ve,3fuj,-5w5s,6gr3,ew0,-503f,q73,-1s6i,58p5,-6rk4,5lqp,cgv,-8npb,8hjx,hxu,-env,-42vo,-12f4,5vkk,2tg8,-8zzd,5yhb,-cb4o,-11r,chcv,-c39,-1y17,58ds,-3c9z,-2k3c,-4anl,-1t3n,-1xlb,7xkv,-8svy,clwr,-10em,-5yj,zxw,-dvnf,aqb9,-2hjv,12i,-1gnr,2axz,7iw,4qpe,-5y7l,13rd,-4xta,4s,7x5p,1er9,-3b6z,fr,-3alh,-3avi,-11j,4w1p,-3ka0,-35p,-ggy,-vzx,-enm,fzf,-271h,b9u,5izx,-5d2v,8lsh,48u2,-544d,4e3t,-2igl,18rt,-61an,-4e3x,rse,8z1l,-2mel,2vwi,-3o45,5cdg,-4xvu,1esy,-4q09,28xt,10wk,-6xi3,7ps4,-bfd,-3jqx,svk,-rp9,3dvs,-5qc,-2ooq,3psn,-3op,b7o,-2nsc,86a7,-fcm2,1x9j,7bjy,-43r9,7g7q,-3d9j,-3l12,870p,-8d5j,1xg4,-ayq,u5p,1foh,3ave,-65px,2smi,-11ua,1t4m,-ew8,-13f1,-3q3h,3opb,1bl,365s,-40kx,dis,-32wh,69l8,1k0i,fmc,-3z8e,-d0v,10qh,1uir,-6siz,733r,c0,-542,-8lj9,10,84r3,9v,-6z9h,3l99,4jis,-4lar,3ogs,gh8,3pda,-9usb,1ahl,4rnu,-ctfe,btrh,-4dlh,-k7,1j35,2lr,-hrr,bu0,-128f,16mh,-enh,-3bf1,3i8d,2xf,101j,-24hu,-7hhn,8i8v,q23,-1xqw,9n,-2508,-118d,3sjl,-3vwc,bi6c,-6bw8,-3kk1,4jer,-1cmq,28rn,1ofu,-687v,4fbo,-bww,5wsh,-6a71,1gp8,-3bgy,1882,-5o9k,4wqy,-327b,-j3w,8goa,-ala9,mal,bqf,arj3,-6wm4,27zy,-1u1g,-i0t,5ju4,-770o,-38cs,4988,1yo3,-7sf,3r6,3amg,-3f45,-4i6n,88x1,-26x8,3phc,1eqm,-bnqp,fg,4ul,2o3a,-6lkc,8l0a,2ioh,-4rbu,28m2,1qum,13sk,45yc,-9s9c,1wza,1wtv,-itm,ink,-kw3,dut,-1h5h,-ddx,1xh1,r,3a6b,-5cdt,v9m,-7nt,-l0y,puc,dsx,2dsh,-7msv,50ub,4prf,-1sno,ba5,-397s,awp,-5179,1z6o,g48,60i,sx7,2nuv,-2p83,v6k,-2nkr,3uuq,3uh,28vg,-i3n,-u8a,-3d6c,-1soi,-2pcy,7e01,prp,-2jz,-1328,oy0,-41b,o0y,-6h9u,35cq,-3mh8,9e9a,-1imq,-39n9,-2v52,4bxd,818,-6ywb,-2mw,a1ob,-4x35,1ykz,-4t1z,-4rx,3k1h,-51r,-4k2,rl,-6tdl,76wc,2518,36el,-69mx,5x8k,-3th,-1vrx,1n4c,-3ge8,-2my,1kbo,sxx,-7kb,-3p76,xyk,1059,-5oxl,6vgp,-3v5,-n32,53l,zh,22rj,-9721,6miv,-41fv,6kzf,-9o9,eia,1i1,-1b26,-69z0,7uzs,-93u3,96la,-2q22,-xxy,1i6v,-x11,-f5,nq,-3h7,3ex,oqd,2pin,-6r25,3uvk,4djf,-5d5d,-35k7,5q,6sqm,1f3o,-1fvd,-1r3,631,-3my5,2kp1,-z,3nkn,-8983,3oex,1424,-77vh,6fmd,-1v28,293o,-2d6m,-5u7e,6u3p,-14y9,-hfr,gmh,-7da6,6t33,340p,-2jqb,fm6,6k6z,-7zot,-85i,16in,-2ik,-16mt,-27l,-uve,6ic,1bn,-mwh,gbz,1dwf,-c41,ts,-4hkq,5fvt,56rc,-2yg,-6ytx,ee1,4sp0,-4nc,-bdj,-za6,-7o9,-9bk,-7e1e,7j6j,-17xp,151l,1q3s,f1y,-w4g,-2ln2,37l2,-3ed,-4z,10j,zj,-16l2,bmu,-t1d,-5x3v,67vd,-4v8,-q3f,b9v,-bmge,bljw,1eg9,-1f1n,-ayt,-8y0,-1u5b,2erm,2jfc,-b21o,9on2,-5r8,-3t0,-2u1,-9ztq,26x,9cym,-68kg,6smv,-4gua,5c93,-3oc2,2wyb,8ej,-ipf,-7fkk,5iue,2k5c,7yi,-2mge,2my,-2r9,1uh1,16f9,-2ws8,-8l,frt,3oku,-5ex7,-10d8,-25c,3sr2,-13k3,1ugm,-2gcd,2vd9,-2287,3t9,3h5,k9s,-96g,-f64,8d,-5ixa,4yjh,1yu,93,1cs,-3vt,6x7,l1t,-2gh,7i,-go8,-8rll,8vcj,-6wh,53i,-5pl9,5ujq,-ced,-1y0,gmw,lx,-736,-g6,2x8,7cg,4v8,28yd,30c1,-9j8m,52dn,uwx,-8c7x,8rk3,-hty,-5yez,49sg,20s,6mf,-3kgt,647l,5un,-2r2m,-asl,-t23,1cbw,-bqq,-4qmv,9d35,-2icx,l,-36nf,179a,1yqx,-3gcl,3p3b,-209m,-kiz,m51,17pe,-ojq,1wy8,-35c8,69ye,-3y95,-12ma,183x,-1l0c,-2lch,1qae,1dz6,-181j,-2qc4,14zk,zro,-2lc,2vn,-hwp,-1lv4,1fje,qn,-gi2,-cmx,g0p,16v2,-kas,-9ep,-1evr,15q,-3fex,5tcc,-4sed,6jj2,-x13,-4jb6,-edk,-2w7k,9zcr,-16ro,3i3,k60,-56a4,-1tah,-13i,-5foj,b3i3,1lro,-2auh,ff5,-1moy,-54bd,6euk,-2ul,-ems,1r32,eha,-7y4c,111i,4syo,6qc,3gb1,-4nb5,fvg,-q1d,806,1307,-1l78,-33kw,4sx4,-tzz,-1ju,33fo,-dj0k,-jse,53sk,boqa,-5djt,-8p,41ym,-1kx6,-2yzc,1ny,-bxy,j4,d8w,2co,-mt2,gnr,47i,-3f7,-3iy2,6ktw,bg2,-14y5,gnv,-90qt,bj8z,-5p14,o9s,3fn,-2lx,34vh,-e4oy,dxzw,-1j9d,-1vkp,-2bg,q47,-1orw,1n26,1o5,2bdf,-8j8e,5try,-5359,6sw4,-1qst,-hou,opd,-5h65,-tu1,6rzk,dle,2h4,1a,-5spr,2491,-46n,-38uz,1x23,4oks,-3h9r,2v6b,1rlt,-7lb,-irk,-11xf,hpe,-32ah,7f55,-3e1u,1ff3,-72zl,6ikb,5if,-22dj,1oa,-688x,5etm,-4wm4,3md9,uax,1kqc,6sh,-cj,-3cd5,2sij,-7uv,75o,ilt,-dy77,bxem,4pok,-79a2,-hhw,3js2,-1cv7,tit,44dr,-2qdw,-2lzq,-6ip,2mc,1b2w,429z,kou,-3del,-zt,-3eos,-3kdc,7li9,-3qx5,1g32,-3mbz,d1a,-kbw,88l8,-2opp,-1s6x,-1eyh,2izs,dhv,1yak,xw7,-s5,-8kdz,-774w,6xup,5c3w,1ous,1kow,wv2,-1joz,-72kp,5zzt,-5icv,48dx,1fub,-3k8r,-pt4,-3swz,an1d,-b2ij,8ge3,-4dc4,257c,-522o,9a1h,-2hne,2ft6,-4k,-ra5,-sq,ro,-10x,-3e7w,-2u9a,-566i,7pqs,426a,-638l,568b,-1o12,23l7,-ag5,116q,-fio,-3i66,-1si6,-2gw4,2k4f,5ja,4tki,-6tne,54o6,4s6,2fcy,-3xye,181e,l9q,-jdw,-32ud,4ino,-5jzv,87wc,-4byi,1odz,42w,13v1,-71ph,-2nq1,7oz2,-5yio,3n52,-47xx,1rf7,1uq5,-9nn,-2cbq,39,13bk,49do,4q9t,-jk,-169t,-jeq,-apa,il9,-bfi,-40m,3dep,-qaa,-7xib,4f4,-4gup,1uny,6de3,-34yd,4axj,-4md6,hfx,-45zl,14f,62l9,-478x,549,3ysf,-4vof,50fe,-3w4b,6g3,2ne,-34zk,2n8f,-3269,2sku,-84o,26v8,-2wrr,7l6,-quk,-5h,1r,-ct,qhu,46g7,-6p3i,1ssi,4gm,4rlg,-47b,i0w,421u,-90km,-jg9,6nu,-ygp,2vi1,4cyi,-1xu,-cmwr,agph,-4qht,-6rx,-7gz1,dou2,-8vg,-939s,c1pl,-10cf,-58c0,1s2,-3rby,4in0,5hm5,-9y3,-17h7,1mve,-72gl,9mt3,-7lw7,80uh,-3lh4,-5u6w,-10lt,py6,dj,3zza,-hk,-1wcy,-13u5,-id7,-2o,-4f88,3t3k,-3i6i,-3nt7,7d0c,6l17,-4j2s,-314h,12yw,iqc,-2yoj,5uyh,-5wb9,-2c5,1brw,6gk,-1oe2,-d2i,117u,-iv0,-2inb,3zjj,1kjo,-3yz9,-8c3,7cxo,-6yy3,7zz0,-86nh,-awr,40h8,-w85,-1gzn,iv2,-2g,-209i,13id,4a8,-upc,n0b,-8av,1w7,ae3,-wq,-bzd,4ddt,1x1i,-327v,4wji,1rh,-97eh,7pgn,-8ss,-1tmr,40kz,2c7,-86tt,-5a7c,qnt,6t5b,-1gh0,109d,-58x,bvm,79l,-3pu5,9msk,-7za0,8obk,-dmbf,6eld,-2jcj,12xu,6i4p,-63k,-815,j4,-6nbo,-spw,z35,-95f,8pil,-9iwa,-1waw,15cl,70nm,-2io,-zz,-32ck,2gay,3yk3,-9v9t,3h2e,-3bw7,33ub,1umk,-5i4,nt,oie,lfr,-26rd,237j,-x20,-oa8,25r0,-2li8,1m0h,1rie,tim,-81n6,7wbb,-7ok7,e4x,-d3j,-jqh,-6nc,-7yu,h6o,-epa,cq7,88z,a7f,-nik,28zj,5q62,-65k0,-1k4y,10v8,6k06,-5p5n,1kb,1qu0,gan,39,-3qbe,1rp,13ka,-a7d,8zro,-2qyk,-3xxx,-2pxq,1y1l,-2lvr,1blm,2z6u,-8kt,9q4,-fjn,34f7,-3r,-dsz,-ekb,1jc0,-5mhx,7uik,-1sei,-bhx,28tg,-3ro6,qlx,-1fhv,2ymt,-26s,u1,-4uyu,4f5d,-3m07,-d9j,d92,2gf0,-75ww,73k2,og2,-n,24rq,-1fgk,-a7o,10fm,-11rc,-6waq,7i2r,-hia,-7ur1,7te2,1g57,-1u2y,20xk,-97q,-5zm,-3bt6,o18,-4k,-2ttc,33ke,-2nej,1nlq,-4jlo,2sv0,-n0,-1jzp,711u,-73l8,5fbi,-7of,-2zhk,-9hl3,8t83,-nnl,-mp5,3b2,8myx,-8n8v,2r8d,3e7c,vk5,-tln,-33o9,-h9w,abr,12ev,3vc,-cyh,-1tq,oir,3m,-4u,wzs,-r9g,-1y32,-tb2,-219a,5y5i,-pzi,-2qz7,-3544,1jid,-5ikj,d655,-862f,6de,4sz3,3rz2,-a8gg,-5lfs,byuo,-2hs1,y6,-8mhe,azj4,-6phw,63cc,rd5,-53jg,7ak0,-7svo,43,-595n,4p48,2a43,-ht9,-7745,5pdf,bef8,-560,-86jq,-uyf,-zwp,5h8p,22kv,-633c,-2l6l,-7rwh,7v5t,8bzc,-41f9,41k7,33c,-29q,2bp,-4mv,-63ff,1cv,8dw,-qu1,6bqo,-3npx,1i,1d,-7jpq,83w8,37so,-4ax4,46x9,1ft,-29,20,-2xxf,-294x,8xjb,-5h0s,-249h,3hbn,-7i7n,7sn9,-2xsl,-3xvs,-1nqx,ove,45c5,-ff,-aj2j,7tzw,2d2,7pt,5xn4,-8skx,7djj,15o4,1a0,-883,-7yqg,-c1e,5iub,2ay,-ha,5z9i,-39t5,6pz,-26q,-a51,-1z4z,2np1,-2gls,-2ozo,7ua2,-53qw,-7qv1,3z42,1s82,1xxt,-5q8s,5udv,396x,-35f0,-57pf,-mmi,4wsg,415s,-3vq6,-1q0,-9pr,32g2,kez,6hs,-9qa6,92xh,-6ifm,4rk8,1at6,-nwb,-48l,-rc,j3,1w9y,-2non,-1xxj,115y,-9g8,2mq,-3wdj,e6s,3kqv,450h,-5w2j,2568,-q6z,j0g,-3k3p,2tsz,2kwz,-403n,6nus,-1qmd,3ep,-78t,a70,-c8n1,61j3,lz1,-17o5,1pq2,-1cz8,2sta,-9dfq,b2qm,-93vi,8f28,32d6,-3pvm,-2iu4,2r4r,-3cj7,-2161,5usm,-cnxb,frlx,-5yu5,5qw,27xo,a81,-1uvr,40sw,-6ag,-4p7z,1uh7,-20cx,3qgg,-638w,1r7e,v4l,dus,2g6z,2rb0,-61zu,6g44,-2hcm,47a0,-6hdf,1sp,7iw,55m,-2b49,j6z,-wvr,fe9,2n5v,-17yd,-3fyi,30vz,-3pq,44yw,-2av8,-4lo,3go9,-bmjp,4kk7,-5yrj,83i1,6n7,-38xs,7vtr,-1z4o,-3xa6,2zo5,-20m1,1tkr,1bd,-3uju,42tp,-488m,4frd,3hw,-4aq,-c9o,3a8g,-6st7,3udh,itv,-46z,-fqb,3z7,-3y3o,-620e,-2i1u,-if,cywp,-pg1,scy,-vae,-52f,-6le6,6l9g,70d,-b3yr,1z0m,9f1j,3uq,-a0on,ct3,ev5i,-6cw,-fpyy,a4yn,-11ro,-9mtq,89rf,-mb,34kn,2iqi,11c,-231,-1g8b,-1tfd,-9wxw,-2y2t,gnu,tcp,-19je,d3qs,24pn,-bstm,7gv8,83rj,-3ds,-8gwn,qzm,-vrx,4n73,-477u,akt,-4c7z,8yxe,idy,-3x6,12z,-k4,7c,-5vf9,5vl1,1vq,-5bvk,53xm,-184,7en,1ku,52,-3hx,3e,bk,3tx,391,7h,-bb3,273,m7,-4ze,3vi,l0,tm,tb,2ir,4nj,-2z,-cih,-cj,epq,ab,-4ox,9bz,-6bn,5tf,1px,2ie,-hgr,-8b9,-2ou,ca,aq7,50o,-7z3e,4le6,jik,27k7,-25w1,2cis,-6w86,3llw,co7,blg,-t50,6m5z,-g9ol,diu1,-3hv1,gal,-1lwm,-4tjr,6d5f,-2fpw,-72wc,6c6p,-4a09,-7f3,-16st,7gz7,-nh8,-8rmq,cr9y,-g8f,-bhkm,7l0,91as,dz9,4lgu,-9a5o,4py7,-22mz,2fcq,-1vr9,24wy,-3fyj,34c1,-3rry,pup,2wjv,1a2a,4fw7,-dzam,27v3,62t4,161i,-1d8c,-2573,-8cx,-4z4y,-451,721p,27uj,-7jrs,-1jqb,amd5,-17h1,-b5r6,a0ph,bgn,-k76,7uq,-552m,-1zge,4hrg,-1801,f3a,2yko,-sa5,-17we,-59ix,1cxx,c2m,-btu,tf5,-87p,-fc5,-xq5,4go,-39vt,5ozw,2ur1,16qw,2vr,-wed,-9k47,wb9,132,-1m3,-2c3,1xh,-tk,-3nx,39k,-32s,8glb,49pm,-3mkj,-3n9q,-8xd,6wa,bhc,-2zl,-xqy,6mmf,-3gzx,-81tz,-2p3u,9t4a,68hw,3caa,-913r,-1xx,32oc,1lb1,-edld,14ih,862e,3fnt,-37w4,3xn4,-1f6f,-7wlu,8m8v,54sq,-6xaj,4q9y,-6nvj,1gls,2rra,-724o,5plw,-36ke,6zkc,5p,-92ol,-69x,9kef,-8bvr,-4ph,6vf,-2bs,4aw9,-1xbv,50mn,-2gs0,-acrp,3rlh,-3bgh,8co8,1igk,-36pw,-38ky,-723v,ciny,-2x1k,3iw2,-2ucd,5k1j,1jbd,-2m9n,-26ye,-2pzl,-2pco,73vw,-9db,-15vl,1gbg,-7d,69l,-1s2a,awr,-1hvm,9ef,-2vgz,dks,pua,4t4,1dl,fqu,-3uuu,-oc2,705b,2jru,-93e,fcx,-5g7,-7nn9,bhu,2w6e,-1lud,col,6h37,-82d9,9vjd,-9hq9,6kf3,qny,-kdv,iud,c4,-4a2w,1z0x,266e,2o7,-86m,-681f,-8123,97y8,-3in6,68yq,-isb,-4c2o,3ugc,1hhk,3rp7,-2cbv,-8oy2,3l1x,3k52,-ex3,-1mbh,-2n78,6jl7,-abvz,3ut2,-se3,33sr,-4js9,-1p10,a45e,-60je,-5hm,-2p0n,-4p5,uvq,56zl,-1vfm,3hxp,-e43,wh8,20xg,-9805,bl4a,-2lxb,-w52,-8074,1gyf,-1g0w,15y4,a10,-7jr,1365,13j8,-ew0,6fq,-2rn,gri,431n,-3qs,-11zf,-39d3,-13b,1xvs,1en1,-1ia4,-ebw,-66,2ed,-3zmh,cc7,-38q,-7kq,1hob,cyb,-2k2,6ym,-2px,-1uz,3iln,-34bx,fyk,1wy1,3na8,-7myi,aa19,-4j2o,-9cig,-1dvt,6jeb,-6dmm,9owv,51y6,-g5s9,1mex,-k5o,zis,r9y,-mu9,e7u,8zp,-2hv,72t,-ocg,-jqp,1l5k,2u49,-2tdm,-3mpt,2exq,-as1,-ut1,-4ei,32xe,cf91,-etjp,1url,7vll,-5bd1,-t01,-b0l,2m8w,6jyt,-2sfp,-6fwe,-z8a,38i,m6,6sfv,-5o2,-18z,-gdc,-kf7,e03,-1j7g,3kan,4oo,-cpz,-2mr8,698,1e79,-uof,-52w,1grc,-8u98,adik,-21qg,-1vwl,2j6o,3td,-2qg1,5ah,hrv,21l,7fg,-1cvj,-fom,-29u,3ota,-2zfz,d9c,-601,-op8,ae8,-2er,hfj,6ve,-5h3,-faq,10q9,tgo,-34ft,1deh,-ql9,-mvw,13,cqh,1n8g,-1ygn,9o3,1ko5,84j6,-9qaf,t9s,-4lw,-19ki,-2qmk,8h9,-6ty,afef,-72h0,wl,kge,3a65,zv5,-4avm,2dyo,-2xae,2cg7,-3opv,57k4,-4wt,zze,11zq,q0,-fbj2,6un4,6m7v,1cox,-3tmk,-26ka,-65h7,bpm9,o8,2ye,o6,-4uv,3t22,-3gti,-14cq,942,-1edo,5m7o,-2lfa,-137,-csq2,a3q0,-d2f,-44ze,57kj,-68dz,56b3,168i,3aht,-dzu8,6tmo,4f8h,-4mz,1ni,26ag,-7gjv,jme,-4v1,a7k,-j7k,-2o9,-2aok,14y2,13t5,-3fqj,d8q,9no4,-60du,-2qs4,8s7h,-8wxc,1xdp,2rju,30b5,-2ua,-4tuh,1f6,5zix,-1c1,1xyg,-1ew,1w1,45t,582,-3r6a,-47wn,-5kn,1jo,qz,361,1p1u,-3g,2jx,-1qi,-bk,-2di,-ge,-18a,83,3jt,51,-2b4j,-21l,-1qm,4vcu,-szo,-e7p,tv6,-1qbq,1vh9,-3ku6,68zx,1aie,48,-2m6d,-9y1x,3u5x,u25,-dr,5pfs,x7b,-26,21bj,-8gn3,-3ud1,23d5,4zlq,-3ei0,-c96,14d0,3pv,-51l8,5dyu,-2mgy,20th,4l7f,-75c,-12kb,a95,-2tpj,334,452d,-33p,-1kt,-1z1,-3cg,-1np,1kn,-k8,-4oz6,27og,22ji,15dp,-a6vr,4q9w,5uk,13ci,-aby1,6imv,2dqk,36kc,-aq8g,82fi,c2b,-38kg,4zsa,o2k,-4u7p,2c,2ao,5fvv,-1fab,-1so,-3qnb,7z3j,-7t8n,3dmz,2vxx,-2pjg,5x7,-7tw3,60aj,-1rt8,579n,-1rqg,4jz6,-381r,-72db,2l76,2jo,-bv4,1gfm,2jb,t76,mji,-100e,1tx,-1lbk,ksx,ep,-2jon,n35,gyu,-asi,2pzw,-3mbo,-1daj,7v2,ftx,2lh3,r0j,-cpv,pp,wgc,-3iwq,-hay,-27d,8fm,1y6t,-x19,3lcz,2yb8,-2ql0,muu,-11s9,6ng,-zbh,2emr,2d95,-sbh,-4jz,12v,-54k,-5w30,6o3e,1rrx,5a,2p6,gyh,-1bhf,-4hk,-1dm,k3w,-8y4,vn3,-mw4,-13p,15w4,-sfp,-p75,f3g,-a0j,3oh,b1,-azri,23n,d0w2,-155b,73p,-21gs,u6h,-vct,175e,-7fv,-106,-20cf,-2sr,-em7,1a02,-2hl,8xc,-1774,-r9n,-1ntr,-33,-3xp1,2tie,2v4q,-din,-2o,-13t,7k,2f22,-4wg8,-37a6,-h2p,6rhd,lzy,-ett,ths,-7dl1,m7m,8gwm,-7f2x,-1b6,698,-1hw,-1io5,-9lz,90qu,-418,2mh9,-a99m,7hb9,-705p,74z4,-7gpj,7opp,-cjm,ak,-ic2,-7o6,1o2,12b7,-77as,u4,-p5,7er8,-6n69,6uqv,-6sks,-2b3,c1y,-6ez,-931,-boi,8z0,8ub,-td3,-egl,6x0y,-5ipp,7s5,9h,-2ntg,-5pd,1a8e,am,-gdu,7lid,q47,-6js0,-atf,68jy,-4md5,75o,-qt,-3nj,nyz,-28tr,5qcv,-ipk,-1yjg,1hp,-4jk1,-2bjd,8yys,-85jr,2dmd,sn7,-beks,9jx5,ejf,-3j2e,v6n,a8k,-ior,2as4,-aai,-2kqn,2uzl,-2ip0,ks3,-2enr,33iz,1c3a,-119d,3yc1,-17jm,6va6,-4ctb,4gx2,-1g4b,-3yus,-a0sk,-srb,ca50,-k4c,2o1x,3pyp,-1ir3,-5khf,hz1,-3iua,8egu,-1t4m,-ebfw,bcbk,-3lnq,2b2u,1pvm,6hg,4sg,-vs,-9fuh,na,dzg,ius,-py8,lj3,5pa,46l,625,21j,5xn,-ouv,4u3,2mw,2cb,5bws,-b9c,-3z87,-gkf,om,10bs,-10mf,4nz,7mx,-hwo,-6jl,108a,h2h,3n2,77b,-ame,35t,-epq,-126,e6f,-400,6bl,9rx,-wma,18kl,-a2k,j39,ael,-2d6,-4p2,-cb6,-ymn,57j,-7av,-2ic,-2sc,38x4,8lk2,-2gls,-g09s,6fgn,-5mhk,f39b,-7vi,-6cc3,-80cc,-4m,bpy1,2v3e,-73gf,tle,1bhr,a2d,4eyr,-1u6u,oh3,-45bn,48jt,-1b33,-1ho5,-c3o0,13z,3428,7ne1,2m6s,qv6,-9fik,-4ae,8s09,-385v,-9pw,17q7,31dt,-vgu,565h,-400t,-2hzn,-399i,1h9u,4qio,-4quv,3sqy,-4uho,-1kux,-5id2,8b5v,ul9,-2j92,xtv,8kek,-799n,-7myw,abpf,-egm,-a2g7,9vr5,-2sft,-172a,63m3,-dmrl,gc42,-7x0g,-7nbt,12w,-4f6,pvh,-ari,-1xj,7bb,ablz,yh0,-8vkb,6122,-f5s,-1r5m,d1a,6w0n,-233m,5aj0,124,-4n3n,-o,-40u7,-1tck,72ef,-4uzo,2c4r,41xb,-6sj7,2pih,-9d5i,9zqm,-sn2,-5iep,8grn,1bhy,-6hbe,598k,-5a7z,41t2,-1qed,603y,-b1e1,-ewu,-1ih7,-o6q,aem2,-9wbv,5jv,eqj,-5by,-np,7hw,-hui,1aew,7f1u,-19kr,b63,-k05,2n62,-1o4k,4f9k,-4r1p,-66vl,6may,-4dne,3x2b,-425,pz,-bevp,avog,-4rb3,4lod,-2nf,22bn,-23dg,h9,1xoa,-126i,-8p,k1z,38e,-qe,-2ho7,99y,-ahve,-mv9,1u0h,-2g6l,5s7y,6r00,364i,-y,-9ing,9195,1kq,4dw,-3,19t,-36cp,3b4m,-cid,-4hq,-473,1cyq,-6q97,1tiq,4if3,-60bu,2nyz,1m8,-9da1,-3xen,d70a,2qe,-sq,gg,-r9,-1q5,2j4,-1n9,6,6nw,-30e,-3olh,5aq9,-1ilk,-2kw1,-76k8,9ji3,-9ch0,6l4p,4axu,-a6wu,96x0,ndj,-58ro,-6f4c,ewv6,-1qr6,-1f1i,-aqsa,97a7,34r4,-8osw,-161,zya,-lnj,-hkm,47am,-hug,36nd,-eysl,8d32,123e,470z,2rx,2upm,wz9,-53b4,4l8i,-6d2,-d8f,-5g5,xwl,-2yf6,1whd,1758,-gyb,-fpi,-6u7f,-66e,56o,-x6d,1hzu,63co,-6ju9,2h7,-e9i,2k,yfm,744l,-1db,-yq2,40r,a2l,-vhi,-4d10,agb,81d,-1aa1,36hk,-8la,11mk,-598c,7hxo,-74nb,-fld,tf7,9hn,-46v,gsi,-cii,-xyh,-83,-3eu,1h9j,2osd,-2ek8,1vo6,oeb,-1cfp,azt,rcw,t7v,b92,-4p91,3wc7,uoh,-8yc,89i,-2g,gpu,-17s,-em5,2e9,-y,-8az,31qa,-ep,-2mf1,3cgs,-5dkf,-22g,-13n,-686j,5s15,-1ngp,4x9n,-24,ue,-5c5,-yw,-32a,tv8,-9c05,1raa,1xqq,-68g5,b6a2,1g0,-2n9,-5cc,-97,-3eev,cff,-i45,-8cs,-ues,1jzy,e5c,-bbd,-1vo,-3vf0,3ugr,-1yos,-wm2,-eux,2bzj,-7p8,irh,-526p,gxz,4jzq,-1lu,-4a04,-lm6,4ymd,2646,14l,-kj,-5gr,7mh,ec,12j,-61w,507,87m,-8li,mg,4n2,k0,2p8x,-2df,-4a3,-vvd,-kv0,-xa,-nfp,14pv,-1h6,-hu,-e,174,-3dg,1xf,m08,-2oi,2t2,2nq,-9x1r,4ag,-5xi,bbh,-otz,xjs,mul,-6nc,39p,1may,6k96,-4ajk,-4gj,2qt,-40r,-1gz1,682,631y,-4o2,7pa,-pkg,3hv,-66l,1dh,4ag,-sg,5bw,-hx,3s4,-2zq,-2s1q,-igx,fov,-rnt,-39t,4f1,-jcc,11qe,-175p,ao,-4pa,-237,5t7,co3,-oao,-c4h,1f6u,shv,-2fca,-73l,5s39,d0,-4sr,-aes,-6hle,-hze,-3eej,2a8n,-217u,78n,-gll,-1jjv,hqr,47t7,-3016,pb8,-5g7,4hwe,5jwj,1rvl,-9fkx,-bb6,-27g,-8j0,ax8u,-b4qd,688,bdqs,-9a7e,9c3x,9g7,-7wli,-euc,8exw,-8yze,-29ay,94hq,bn9,-2dy9,-14c8,-zhg,-2vaz,7lx3,-1q9,-1ig,7d7,2bus,-8edu,5x01,-cxh,-40g,-4ir,-y70,1gzo,-1ejt,22wi,-avlr,5jpn,9t4,3pph,-3bec,691j,do0,-2hc,h9v,-13v,-13yx,-1bm2,1mo7,-nz8,r9h,ijq,-2xb2,46z,fhm,-hkn,-lzd,19y8,a2a,-g3h,u1,hj,-a3e,289k,-5io,fyh,9l6,43o,-5a2w,27vw,-ot,b22,-1p7q,1x7d,-avns,acv5,-1mw0,-4aqm,-a76p,-73z,-ct,3ng,6xox,1kl,3jgm,-3lv,-8z,-77g,52m8,-3p3,8p5,64,h,-1cvb,26n,111r,-bxwr,72sv,-77kp,-9zk,p0u,-xlc,dian,-93dk,14is,-5ti7,6jb7,-3qz,-22u9,-b95,1vm1,40qr,-2rde,-1ig,-sce,w0e,8dj,6ig,4nl,-qft,-7doo,7791,2ubq,ymn,3c6,-d5j,7bd,10wq,-3jwa,6a0p,-2ns,-i4,-5u,-bch4,9rtm,1xor,-ddvy,9my,q90,mbn,28kw,6w7u,-7q9s,2u48,7eo3,-c5i4,-3fu,b0m,1mr,-2of,c3ve,-a4u1,199a,541,2hg,-1a4i,gji,9j1x,-967y,-e,65o,2tn,9lhb,-bphb,apf,1zw6,8kkg,-2cp,-83iq,gm2,a0l,17pi,1rz6,-38at,2ql3,2hpb,-2o4,283,-3d3c,371w,5m9,xld,149,l2,-2ggm,-33i4,2j8,21rk,-1ovk,-af1,3l9,-jxv,io9,-1c9,-11vz,-rqq,4c3n,2lgp,-6gzf,6lkj,-6g1t,3u4p,-2moh,21rn,-1zza,-2wq,-1xd,58z,1ey,-6s5,ky,-klg,4is,53t,-g03,2tgl,436d,-ost,-cbk,7qq,-1u6,-24iq,-xyz,ckx,wr8,-1eyz,2xz9,-4dpo,4z92,-4xz5,-148,29jc,-1il,e1,10r,-8zp,-31k,-4vc,-6k,-co6,kd2,-f6,-kt,7fp,ltx,-rft,-17o,-1fo7,-28dm,-5t6s,9g8i,1yjv,-62i,-3dpj,7ns5,-7kju,1a0j,230,398h,-bt,-9fij,9wy5,-4v75,-aw2,h5n,-1hh7,19v,a3k,3eh,740,58y,-1l9,-4j4,-2oft,4roa,-2itk,-4py,5glc,-22cu,8y,-n72,-3mr,5fs,-166x,-21j4,3qu,-8z9,-2of,-130e,5yga,6k7,-3lz,3j1z,-fub,-2f7,-4ctn,-5u6p,1q9e,-34es,-o3l,dhi,cjrk,ovw,-6v4o,-9g2,-1w6,cqx,-yu,-4qj2,5pxn,aiw,mwk,-lxf,-48zw,-kpw,6dv,99hj,-3j5,-6nge,6u9,c1s,-hoo,1gam,v46,-18sv,77y,-5c6k,672e,-4b7i,60a7,ud,-du4,4f9,-3b0,-4sb,bi6,31o,-132r,-7mr,-4hkw,-36jk,-8r5,-24n,-19yl,8m7d,-7k2r,89pt,-3x1,705,-cqf,4rd8,-t9h,e93,-l55,-aecx,a9w6,-1ud7,904,-1z31,1xmy,-1e34,-d80,-40bo,-12eu,7sn,3lw,-275,-c9s,-uw5,-13n,-cad,-a4y,h4o,-288n,1cr,-fg,9vzi,4rg,-6vlo,6lqm,-7u90,-cxu,8uyt,-8ykp,21e,2mht,-2cao,-cyy,3hse,-2j93,3cr,ql6,1af,-6u1,1tbg,-5x1u,28i,-gqg,7d3,ypv,9vag,-1nn6,387m,-6vuj,4ch,-ro4,436,8e5,2ai,abn,-s3i,8yu,44p,-3b7,-1h1,5e,-3m,-1c2,-im,1il,3a4,-3d1,-68c,113,u6,5s7,-bqy,7fo,upp,6z4,-1tfv,7f,1zc,-hbc,1s2,5n5,-ie9,11h6,1x0,-aj9,cwl,1w8,eh7,-474,-1in7,1o9,-1b8,-3f5,1ct,-53z,2u1,2r6,-6x3,-5jj,-7nq,3zo3,-edh,14cn,be9,-2ns,b5j,-12a4,-rez,-dti,-4mxq,14l,eg,bla,4s0q,-95r,-1cl,zq,-2pn,4dn,d9y,-56g,-7kq,4va,-uz,-517,2bz0,9ac,1hh,-afb,-a4xc,6vkt,-1dzy,-1cu,7vb,-hw,i9,g9e,-aq,hz7,-hwm,-irb,-29c3,3d9,-xw4,-u2s,8n3r,34g,2x35,-2y65,-1e3,-4z8e,afb1,-6xr6,92a,-3tmd,q2c,2hk,-8p,-1kl,-2gu,cp,5yh,-1blx,25x,-4jc,-2lf,-3dp,4k,2b,bbeu,-b7j1,41y,-24o,-4mv,-qu,2o,19n,3fd,-16x,-11g,ts,-2y1,5ru,1u,5f5,ev,to,-148,-9p3,bppi,-ad2p,n0,-1kw,180,-2ue,-10z,-92r,-6x3,-8yo,20nx,-2p1m,8q,52a,-2s5,6dua,-4lbf,thd,-3rv,-2on2,17xd,-dgh,psc,-3l9u,b8,13fy,sa5,-3gb,-st,4w1k,-2sut,x8,2qu4,-ba,16ix,2sul,-4jp5,-1x1p,8y1,-mi,ch,8w,-3ib6,7k04,-3uh,20l,-aof,46r,bq,23u,3p,-9vj,-7tun,6g1u,4nd6,1ipd,-6bbu,12hh,-3pqv,783b,-1215,1ikz,-1f02,-1xzz,-13k,-1r4,1as,h7,-3ld,a95,f11,-5ek,f5u,-fv3,20z,-21k,-5o8,2t7,2xr,-2m9,-1pw,d88,-4q1,-1wy,14d,62o,37q,1wt,-duk,1qn,-nqn,3z2,-2km,-ec,216,-ny,-r4,-3r4,jgf,9tt,4na,r2,-6gu,14n,-3sd,2n,qj,9,-951,-yh,a37,-29gm,-38t,-rey,-3wlj,9s5n,-45r0,4216,-57iw,2sug,-2w9i,84lv,-15b,-4emu,14xp,-2xa,-5jz9,4u7f,3yi,ak,6cm,-1a,-lkv,elc,1bz0,-4u48,-tho,-17no,5b2s,77h,-9xp0,14n1,24e0,1fb,10ya,p9w,fvp,-of6,-qvc,tbm,-28ca,2yof,-uri,-zv8,wlg,-le,19mg,-2ga6,a1p,16fd,-kuf,-8y6,rtl,-6rk,-xrf,1kkw,nx0,-2qit,-jko,-28jc,4q1r,1r92,-1a05,2g9,-4mnp,1go8,23jx,-3btp,2wjt,1xyw,-3n5d,-2b8p,3nl5,2r8a,-13p3,-2t8o,46eo,-2o3e,1k55,-3o2d,1bn4,k9q,-38r,-6tm,20w,il8,f9k,vxj,rzu,-htr,-1je,-g4p,3pt,3d4f,kc,o72,-ds1,4if,-g7w,gxg,9j,-9o1,awv,-bgg,-13sq,pmu,a8g,-12ib,1j0x,-661,ail,-23c6,-1iy,-2yw,5vm,-1fk0,-cc3,-ykn,2ilr,-23zv,209,r0z,19re,dfj,-uss,-1ihq,-v3,2cgh,cyh,gdf,-c5v,ik7,185i,-4an,-1ydz,26fi,-24rq,1dl7,d9p,-sf,gi1,-1msk,1a5,cy,-grt,v0g,fsi,-lcx,r7i,2a4,-v6l,z2g,-uej,-4s7,19nw,-46a,-2ma,-18p,-120m,yt5,-1do2,fj8,kcx,-15jq,hrw,2bku,-27i9,-uqo,-41,34zd,-284f,-fue,hk9,i9k,-vap,-61t,hha,15z3,zcx,-29px,cvo,1qh5,-1kmt,25xp,-2j2o,2up8,251,-q9d,7hc,-169b,1bn3,-wdy,19ty,-1rg3,wo9,-4sr,-fu4,2je,-82f,ybl,-1ggi,-vug,kn0,33b,-f1s,1hq,5fn,-411,-3hq,1yx,-2ol,7pc,-afg,cd9,-5df,boz,2j9,-3hm,3rf,-msm,-12o1,-4ao,qgq,-1i20,1ao2,360,-1sf,2co,9cx,-a1x,-x7r,15ay,12x,-8ic,574,-13jw,zx7,qo4,-kz3,-5bz,-1myf,4hhc,-4,-62v9,7i0i,-2lv7,k0v,-7ec,-81wz,-fav,27ms,12t,-7ipn,7gss,-16bx,-9zx,-8cp,73vl,-d40,-gr0,-fam,110,-1ne,2tc6,-5px1,120z,-94io,2x7v,-198y,4sl3,-524,1oeu,-8qr,-206w,76hm,1ga6,-d39g,81q2,-alcd,-l2,ot,8b,fi9z,9up,4d5,9uh,izj,-1f37,69,-28v,-2axe,-dpf7,284h,-aw,-2jir,-8l,-gn,n6g,13su,1b7i,-1f5,-2lvp,cv1v,-a6m,-54xi,doz,-5chy,8j1y,-1l2k,db9,4ke8,6x7,-fy3w,g5yo,-dwy3,7kxv,-6t2k,9mpt,8y,4qz,18po,3jhk,-ete6,fa6c,e1e,-67y9,-aidw,9hpu,-15jt,-1ijs,-507f,edy2,1jc,3tb,aly,-1t0,50,-2qn,-ego,xoe,-a03,1g1,1c4p,-157,-1a75,i5,-5m2b,ec,-97rw,dcl5,-didm,dl76,-5r4,-ded,-7m5r,-4kbd,5k15,-87g1,942u,-6y9b,6t,6drq,70z4,-6rmm,-66qq,-bsn,-66m,-18on,fbe2,-cysg,bai1,-dh2p,7mg,nw3,-eva,1mbe,-dyz,43h,qh,-4so,-o86,1kd,-11bm,295a,45w,-2a4,-1bf1,-2w00,2fd1,-230c,3k0n,-236z,2ihs,-5zz,-dy6,-h5v,-nbl,1zp,1dib,-1gt5,-1dh1,-15p2,onf,2uva,-uxg,-qt3,1qsr,4qq,-5tl,-5xr,zc,52,-294,3g2,ry,1e,1r8,-2s9,132,-1fv,174,ni,-811,oo8,76tx,kyr,-ht3,-7isl,-2b6,7dr,6ln,5xbd,-63q8,ml,-19to,bc4b,-dgab,-2u,51n,-ogp,-17d,2yr,-f7o,bsio,1z2i,-90,-3xs,-aikd,-1485,9cr2,-6qu,21c1,-167s,-17n5,-orc,-cl4,-2d,81c,7eim,-4ey0,-cdc8,9r9m,-az2,25k,-qa,16i,-9sa1,9wb2,-2j6,-1k7,nl,-1gv,em,a9,-22p,-tv,4xd,mo,2gc,fgu,-15l,-af7q,1ea,jkl,1av,bv,-b7p,-vag,1gvy,971i,68z5,-1e8,-4zu4,1zmp,-kb,n90,-c1ng,-90z,ds2b,-eku1,17dj,-1jj4,ck1j,-bvrr,5d2,sm5,-1en7,-2h5,2cd,-3da,53n,1um,109u,-10j2,-949,w59,m9k,-38o,2vb,tuf,-j35,8aw3,-e8k,-2j,66,hne,-uej,-765x,-a8b,aww,7u8p,-7qqa,e8dd,41b,-eak9,digu,-39yn,3pix,-e0no,-7rv,dbu1,-2lnd,kts,-449p,-xjd,40g7,34y,-48wh,7uj1,-99wr,4ne,-fcn,-g05,5fih,-13rk,-xhw,5v79,-7php,47k8,-7zv,481p,aob,3dv,-2mb,1s,8ac,-sm,-bw3,-gg,-4mg,-fun,as8,-gu6,-es,-7xtg,5bsj,2bn4,-78jf,-383s,97e,i94,3v,79f,4t38,a9,-ju5,-18z8,-5naw,62gk,3ory,-2ezr,5eh0,-34ap,-69i8,2wbi,2zwn,z1e,-af3x,dw61,-23,174,-o3w,-psi,-2ys5,-2l40,3crv,1jnv,137g,-9kl4,85l9,-6lv2,a4x,-lbv,ms,e4j,-c0m,mkg,-xha,1w0l,2ksx,1ks1,dd,2lr4,-708e,6x29,-63g,-2e85,-opt,36bl,-25wf,-609,26us,a2r,73,16s,-9re,-63t1,61u7,-90yq,-7on,9e61,-g6,5w5,-1t3,-f,-39l,-1l6,1m5,31u,8ev,-y9i,-k8,or5,cla,-dp9,-1q,g,hfx,cwj,-ou,-syy,-453,7gl,-5ts,8uw,-1unw,-2qpt,-27w,4ltp,-67ux,25oz,3cqh,18,7vc,-ohf,1v,-bmd,79,-4a,pty,-2414,34x,4idn,w1,-20qe,q,1r,-abm3,9t41,-pyi,-4nxp,-178,5ul5,21g,-27bv,-17n2,tlc,-a8rd,bh3q,1xw1,-2n9s,2fhy,-q37,-c6mg,56i0,-56it,6xtw,-7grf,8y6i,1pl,-8pc9,8fbq,-8paw,mi,8yd1,rja,d,-9p6p,-kc,a0h6,-bj0g,6d0v,befs,-gf7a,7bs9,-rtg,-6f9k,cs04,-11kd,-bo9s,7zxi,ixj,1psz,-43nx,4457,sr,201y,-2bng,4tl,-1nq,5il,-mhk,wcy,-9f,2s2,aj,-dyl,-d2w,463,-mp,18g,-23c,yty,-qh8,195,-cc,-bwo,-1bp,-17z,-ers,43e4,-1lyw,1h06,-d67,-cnj,-7n88,6cpm,-1o6y,50r,4ibp,n9,-b61p,6gu7,-9fht,-3fl,b43s,-654o,44n7,-10tk,48xn,-dwos,f31o,-38br,-tl6,5gp0,tpn,-6qku,q8q,-k7,2jds,ubo,-oe9,279,-5vaz,2stg,-6aci,cj6q,-4h6u,cdf,3p0,-h1u,26jr,-5chw,at5,-f6,-21uf,-2y5y,3,iem,cx,-6k,91wc,1ol,-2ngb,-hzh,9w9,-4ig,-4qq,-5a6,3rt9,-3tba,142z,-1kyy,6dkm,46,-b1,-3h5x,-53,-2goy,-2qmf,1n,d7,1kx5,-3f18,5rui,35so,-kat,-93dl,8pza,-1iq5,-79de,823s,-19x5,-1wtf,-4inp,-c6t,cwqi,-6unz,30p,a9a,-3q,-3l4t,2tj8,19ag,-1w5,-6rkq,8fy6,ynd,28o,-c8,9dk,-cf9,-1lzd,-8h,-q,mr,-8g,-6p,2ov,31a,11ol,-zm,2d7,1mp,-2re,-17z,-1su,-1a8,-4zd,-1ow,-ao9,ln,3xq,idu,-9j42,8db,8go3,163,-2gm2,2hj,gcs,-ihu,-2,fg1,-zj,-76ps,7m2a,-8kz,2qi,4ll,-4fr,-402,-vrx,8fo,-1nc,12w,-s2,-47rl,23od,-394s,9iht,-9myh,-1ah,cg5y,2k,-a5yo,6nfa,-11ak,-9cpq,6qbs,x5,y4,-oz,-ry,56,-2pc,-1p4,-7b,-12,-bd,24y,dx,-qm,1j7,-ik,-dm2,7ng,-51j,-56l3,5zpw,j9k,2fb,2xd,-6pf1,6urw,-2ks,-c0y,2uo,1zzb,-7hh,8r3,-8x8g,6q8i,5odb,-4s8,-5d95,-4708,9rvz,-1rm,-8k,2rq,-ec9,-8uhm,3yy,69gc,-5k8a,-kq0,ydo,1zys,-2nk4,-cfs,-871,-1w,63o2,-9xw0,3vvc,-2dw,-9t3,4xdw,-3ran,-29s,-1661,66c,-5bz,dkz,3wc8,1h2g,6q4,-5e8t,-gq,-1pz,5sm,-2f,-5o2,-do,5e9f,-5v3o,-651,q94,-59,-8p,z4,jv,-3aq,onw,ev5,zcd,-243c,aw,1ib,6sxb,-3owl,-3yz,-bcz,-2trm,en,vsy,-x32,13m1,-16p3,2jb,95c4,-1a,-13,-gax,-4d,170c,-8aq7,118,-1nhr,8ttd,-7u,-59,-9vdo,-5me,4nt8,3uey,-178z,50,6de,-7h93,2p9,-c5l,-4,8yx0,-z9f,91x,22uc,49e,-7n1u,5dyq,-2zh,-b42,6px,-4tu,-19w,jqv,-ui2,3zr,-601,2h1,-xe,-3f,-b,od7,aat,-11dv,-1z,s7i,-2mzv,-2mdd,-hu,4zmi,-3le,-662n,-40y,426j,195,24ac,-545h,10z0,6bhl,-2688,-8v,-hc5,-4v0,-2e6,811,hxb,-4onh,48js,-2yg,6c,-1u2,-30h,-2np,-1x7,-2gx,-2s9,-2qo,-33w,-51aa,164,5c2h,-6fs,wna,-7z,-c4,1dn,-64a4,5a1a,-2ap,-1mj,-23y,-1vm,-2g1,-1aj,-agqp,dbgr,-75l4,44jp,-baw,-2yh,-31a,-3c2,pyg,-65r,bb,2vg,b1o,-2tw,-2iw,436n,0,-4ent,-6cy,-55f,-2gv,-581,1wl0,-2fz,1e1,-5zl,5ao,27vz,1,-1r,-1a,1l,-29n0,-1j8,-156,2g,-23,-pu,-5w,-4cg,h2r,e5,-m0b,8ip,zzd,2cl,2hq,2ft,-16qo,-o1,kt1,2ww,2gc,5wj,330,2sg,2rp,5ta,6sx,2ry,-102p,1el,2jn,2yk,c2,17y,248,1xh,-44e,-co,-ik,q1,2p8,343,2ul,5pp,-2ub,5gh,2o3,2r7,4gl,2u5,2pb,-ftk,3nh,-5j,-zw,2td,-1lk,-2j6,-59i,-30r,-1d7,cw,-bcs,15w,-6l1o,8gl1,-fupe,ea7x,-6ei0,-1obi,-by8,-9rf,73br,-1h3m,-41yy,-bst,2ad,166,vq,-2j9t,83e2,-9uc3,1mj,7odm,-11,4el9,-3oq9,vpu,-3mjo,4pxd,2iuh,-50om,23w4,-bkfy,37e,-33d,4flo,803k,e,93,-10,-xx,1p,-2a,-ywq,4ul,-4l79,395,33fq,2nt5,-5uqq,-4hmz,1sn,qh,1o7,8su,5adi,1sgj,-475u,4hqr,-e7p,-3m81,-71xd,9aq8,-9l0w,4ed7,-dfm,86h,am0m,-14,-49m1,-2k,-2,58f,-1l11,-9cm7,dr2,bnwk,5d,-bv42,-6a7,4jm2,4pq9,-1cj4,2rip,oh,-5dvd,7hdb,16,2j,-6bip,3gml,t,4lvp,-emiu,98sl,4mlj,-5e,-1o,75,-ewm9,9tur,8,-9v4s,821i,64pt,3egq,-ay1i,b00g,-3ssy,2b4q,bce,-74tb,-2wfd,-a4i,-hvi,882p,-5824,4n3v,-3rj6,-3agm,3cma,6cn,-3lgc,2u3y,-24xy,2lvs,376e,1q3k,-4zvd,-56d2,4f08,-3gv9,1fru,5ga5,-3m98,3pk4,-7quc,1or0,4fn9,-25pt,9f9q,-63bt,-2ilq,2e28,-1ng3,6r5i,-3w8p,-4y16,-1a8m,-2fd8,5a7s,owy,528,nc,1n8v,-7ox7,805c,-2mj9,1njd,-1cq9,4z8b,-37x5,2kfk,1821,-6vr6,77r7,-7gpl,506j,-9p9c,2row,1o8q,nlr,6ypb,-19iw,-5vw6,1bsl","lat":"328xq,mk6,4u7a,70y,-6s04,15dn,-3,-24a3,5ftc,2es,-rsp,-23c9,6tj,x3,-3fc0,-1n8,-1w3,f5,413,h0,8ee,31q,-ho,-4zl,-m6,1gu,-50,-xi,14je,60v,-5v1,c13,-878,456,-ats,1mi,fjc,-oia,n4w,-hr6,2m9,cmk,-bun,-21a,-li5,-3q2,-1qk,-16g,-1k9,-2b5,4zn,1d8,-6hf,2p3,2z1,33n,-3nl,3s6,-5ca,-38w,gcj,-6rv,-2y9,29w,-dut,743,409,-32j,21a,668,1an,-32h,-67w,1bcl,-1fc7,69v,2l8,5ui,-2wm,-2md,-1eg,-2fn,24gv,-n47,-pi7,c3b,-m9p,174x,etn,-m3e,-p6e,4cv,44n,us5,9bk,-569,-crq,6cs,14q,-7v9,-noz,69j,z6z,-9w5,-133z,1dfv,-4j9,339,-daw,-481,-tqr,p4v,ibh,-dp0,-hnd,ebb,-umk,101o,22e,16g0,1yk,-2qr,jl,-a12,bl9,24v,-e4k,-431,6d6,-gid,f7j,-dq8,fe2,-2yd,8s2,-7r,-gwn,17sr,-ym9,dt,17x,2qz,94m,-9m4,16o,-7ge,12e7,-ldm,-aa5,-7k,yx4,-yvq,7c,b54,-7wy,2cp,-73i,10g7,-bfq,2ri,15t6,-7bl,-9mf,-pu,-9dx,2ev,a8y,-b07,j97,kyt,5ce,-4lyu,czws,-b2gq,2qp,1082,1oh,324i,31ye,-268p,-4upv,3qxq,-4crh,c9fb,-au70,19wa,-1h4e,-2ckt,1nug,-3a7,-ayp,-57u,jix,-hyw,-13g7,1v70,-1w2y,524s,-3bqm,-1r0y,1lz,1p6m,3kd5,-3slr,3kbq,380,-5x2,-4zir,1bck,b4d,-8kb,-5lh,4vl,-4s,-15m,-1hh,-8c,anu,-lsa,m28,-2aw,-2sj,45x,-g7x,14m,-3nz,-3zl,-2v0,2bu,-2ai,5fz,4fw,-468,5v,-232,-13w5,2bh,10xy,tbo,-1wq3,3l5f,wsj,msa,-vq,-2aa,-4y17,4v9,lk,23gu,-2c6l,59,mg,-4w1,ef9,5wc7,-3ot,-2pl9,-2n,-1db3,4eaz,-15g,799,-2wss,-2j,-1xhy,1den,-1et5,-1x4k,367,351y,7ovx,-9yao,1v9,-6py,74,2f2u,1k7r,-5d45,46wz,7fa7,-9whf,9xba,-9i08,-txd,6ylk,-1t25,-29fy,-3on7,2u4d,-1dnu,444e,-57iv,2in1,2phl,zs,-3q57,-iu,1af5,-2zvc,18jy,3bgv,16ne,-29cs,-1wge,433k,-3yu,-1rzo,-2qcz,2m0i,-35iy,3e2u,a0le,-9ywh,72ja,-9zgm,2smu,78qx,-76b3,-1lc3,-x5t,26mp,-3fun,3ccn,2x8,-2dhm,biea,-bczk,2kso,-1mzz,1blh,2vbm,-4tfm,1xhs,-3kld,-qed,46ky,-2uir,3avp,-2g0y,506d,-vwv,-1cpa,-4err,b396,-59i6,-1ugv,1o1t,-49jt,1m,2lbd,d8y,-2prw,4qum,-2966,-3r36,3r3r,-47ok,1t8h,nez,-wy9,-1r1z,2d69,4eh,3zj,-1op,-67i,q7b,8fu0,-8u5b,vm4,3xo,-1i52,-1ch,-26,1ik,-2xr,69l,-4nm,6ibs,-118,64t9,-cm1o,-4gk,2btz,-29lt,-1pxw,3541,-2brh,-29,3vvr,y2t,-4850,2f9j,-24xx,-n,1ufl,-3smq,d1z0,-bfc7,ckhk,-58xk,-5n2f,atid,-37e,-3bl,-c51h,22xd,7a76,-78to,-80,8gaf,-8lj8,4b3,-o9u,3er5,-3uqv,-soh,9zjb,-arr1,nh,2rhy,-exi,dql,-2m0y,-au,3xv,3s2s,-2fr7,n0s,81an,-839n,bb31,-9vvi,2bk,-115b,7ki7,-6vrm,-2wcw,1ikh,vgr,-zo,cm9,2bbw,4x55,-7kwh,7k6s,-8pzx,-x7u,29ln,-3esk,pbw,73hc,-2fk5,17k,brl,-68p,-1o7z,-m25,-2eil,9rgu,-bxl,-6260,-ll5,83w,kmy,-4oj,-4bs,6wl5,-7kxu,2b5y,-2bx2,-2330,-plf,-41,6i8,1lw4,24v,6tr,mp1,-2r91,j9l,55bg,-u5,29s5,-3aup,6kfj,-6nqy,-4qy1,8h2o,-674m,2j8h,-hok,9ji4,-98s8,-419,cef,-38ko,7dkc,-5sxf,mf3,-57,2p,6t7g,en,-bkrc,bj3e,-14g,3enr,-e7lf,afed,-atvm,73gd,-7bvq,6we7,6v,-39e1,-39a,-31n,-2um,lh8,el1,1ms1,-4o5,6k4,1z,-6ml,k74,is,-r40,-7mf,ksi,-d65,n8p,1sjg,3f1p,-6k3g,-60m,61u,-2j,-3nu3,2tx,-ia6,3skp,-11,6cw4,-2eh8,2fdr,-9q16,-2p1,-shq,a0h3,1eo,3ek6,-cwxk,-f2x,8nx,-3mi,gp6,fe8,-cg3,-60a,1hb5,-29n7,2nv7,-1k5r,24n8,5hpi,-2car,-2y5g,-1em,avs,-2osk,2p3p,-7p,-j2i,-11,1i5m,aj6,-2s5t,9h7,1dxo,185r,-cbq,-1ajt,3k7,d4,-1g8y,-l9m,lyc,csc,2xv5,i3,-vq,-pz9,35ie,-4j5u,11v5,hvq,1d95,-6b2b,-5fk,269,1iqx,9stt,-bk48,5t09,-3aka,-ymp,1xyo,-6vo,36a,-3cnr,-dx,5f4n,139r,-4wt4,3gmu,gq2,-1jbx,-2eg6,2abg,1l0z,-79,-2ca2,29s6,-5fmk,393h,5387,-3t6d,1dyf,-84j,-5w4,-21jr,1yd9,-u,-3hj2,7ab,4ojp,-1qw4,-3a4,6pxp,-a9mh,2kqy,-1yi4,-yv,1ys,-28g,1mf,-2ff,1vnb,-foa,-1665,3iq,-t5,637,s6t,-w6a,-bmm,-1me,189,-55,1fp7,-1xt,-4qq,-7i4,-1hzl,2x36,a7c0,-b4hy,-2sfa,8fxr,-6m5c,ea8,-1crx,9gwy,-882s,3gm5,o1,4u2a,-5v,276,-2xru,-660b,-j7k,4sw6,-39nm,-22f6,4n4r,-33rn,3n3t,-163,-4yd9,pid,-d4u,3nlp,-4dkg,1j7x,4dyv,-44cb,-3g9e,43vg,-45fy,1529,-76v,gcf,9snm,-2579,-7jy,-7ptj,1cnf,dz,4gp,bx9,-pn,3q0,3xuh,-hk,y,-28r,-4pvc,5gg,1w,22ek,-1q9z,2ica,1dfq,-16c,-1c9k,-nx,9v,coo,37q,-g1n,1ldl,-1tmb,-2mub,2vkn,-6og,1kwz,-44tu,438r,-3hvs,-1bg2,shq,9anc,-8w1l,lnh,7w1p,-1i,51f6,-d3tc,-tmw,4pwv,1we9,-4epw,awb4,-94zc,-48t3,688,-7d,-5pj,9bo,-4cg,19z,d5,-1kvt,-62l,2cyy,-p58,81d,-bt6,cak,-34u,7fj,ns0,2u3,1h6q,1kk1,-3tgl,3u7a,-2z0v,-2d9a,xtb,1dej,-1y6v,aesn,3jm,2tu6,-cjfp,2s2o,-4zw,-3ru1,21sz,39xf,-17bh,-2uo7,7zqi,-5yj4,-204n,-san,-jby,3err,6s4q,-8ibz,1a10,-13z,-dp1,-1ap,-1qco,3rzi,-45ka,2fhd,381,-2r7i,27kv,-c6w,ti7,-3am,-1s49,21x1,-c31,w69,1qxw,-28xl,7kj5,-9jlr,16d,cy,5fk4,-463r,5fru,-6y53,-6lx,37uk,-1uu8,1oj,381e,-2fi6,1vla,-13t3,-2q5,-146i,2dy,9h2i,-16tw,-3axi,-4f8k,3yu,-1z4z,3ccb,-3cdr,-4f,1ell,-2nw,-29xh,3ib,tp4,425c,bx1,5e39,-82rm,1gp0,6k16,39mr,-cln5,-2ay,-3zf,-1xjw,2aq7,-1u,1q6,111,-64p,1psa,1xjj,-it,913j,-2fp,-6fkp,-6x2x,d9by,-8vby,-m,-10,5zwy,-5ask,8aa7,-14t,-7ny2,-4j3g,-rxz,ull,1i2l,aex0,-cmtm,1j2,48q,3mmr,-4wfh,duxt,-3jlh,-5pou,-2m7o,7i0s,4lb2,-w6v,-3nxc,-8ndy,9yc7,-53gv,51a8,-4v,-g2q,-4c7,z0,y0h,-be4a,4bf,-2b1,3dxr,-1i8a,-ag,-q6y,418i,-4lrl,-9o,307,ph5,7713,-5qws,-1klq,1ry5,-1q2h,-3y4,6gon,2o,2zl6,-ablb,4ics,-3g1y,-1cbe,4zni,-3y14,-hlm,-387,-2wf,-32m,a5t2,-4utc,-d5u,3m4p,-8v2r,onl,8vgr,-a1bd,-3db,1b,2lgm,-2ig4,a17z,-8sfy,cttq,-57o,-9rsk,-2hys,-1oy7,381z,-1z17,cog,-kum,1dxw,1dzp,-36qj,d0b3,-cdv0,-31b,-hqb,er1f,-daqr,8t59,-7zrx,-152l,ahwb,-l9,-6ah,-adjs,25w,2uvh,-3uj1,dmxl,-efvg,54tx,6sty,-8ino,5nkl,-1fq,-560f,-30q5,2jkp,3o9,axj6,-d0h1,3gx4,-1xbk,8rfp,-8div,-1ps,7oeq,-7o9y,-6ak,j2,2twu,-5lri,3nif,eei,-3dkh,1he7,69g2,5k,-54db,-esc,-2vzj,z4s,3043,-1i7v,-1ycf,dcip,-f7zd,6kl6,-6rpv,2xzy,-4vu,-15fp,37fb,50kr,-ld7,-2k29,-9k,16kb,-2ena,-4iw,-27d7,5k7,4fmt,-1ey2,-ga5,-y8v,-328d,-jsi,-1vn,6cpn,3mxl,qa,-yao,1ewm,-4c1,ao4,-c0s,-jpz,100i,-gvl,xst,-2x3c,-9ie3,7tj8,-57pv,8kb5,-5teq,12pa,-1qv4,32sv,6dae,odi,-audl,-111s,1nho,-3l2m,3xxd,-wtm,1oui,-4mnt,afqu,-728d,-4mct,ab1b,ny,-5utb,-v4f,ode,-1c1k,4xlw,-60pw,546h,v9v,1m73,-89q2,1dpf,6vcb,133o,-3k0q,-5cet,2hcw,wxt,-38jx,152h,-18i9,2cti,-129u,-m6l,5jf9,-3e0g,7l2m,-4fvq,-2js9,vsf,1jt7,-2l1f,-41g0,70uw,f9,-1kqc,561b,3gth,-eb4t,6mk3,-vp5,-1zd,-171y,-4nb,-2f76,50f8,-xyx,yaf,e2,3o1,4ghy,-9,-5ns2,d,57b8,-6r08,18vq,-1cil,150v,1c57,-38n9,2pe3,-3xia,25iy,4viu,-28oc,-28oq,74u0,-bd1h,-2db,-220,37v,dzv,-f00,mq1,1ly3,b4m,5b,44lh,2jtc,-hls,-6gdq,-209i,64af,-2f,-43bz,-91i,1tf6,74tn,-a7ws,3udc,t5e,b6d,-25hv,3z5h,-1gyw,-15u2,1ize,-g80,-2tnj,2nfy,8v0,-2463,3ax,6x38,-75gq,10fy,-2v6i,-itd,8yy7,pkn,-4ht,-92dq,-izw,-zxt,5str,-3jfk,-1c8f,-11qm,bq0c,-7fl7,1sl3,gk1,-c7o,-4a0j,4mu0,20u8,-7i57,4q5f,-42nq,2ok8,64kt,9xj,-91f,3q1y,-6bi7,-4gm9,-32yu,3kub,-hg9,4kap,-6gnz,hdj,37zy,jb1,gb4,-bp3,-46t,jd,-14h,-2x1j,tiv,2hxt,-m,-3n2u,-1w9m,1vju,30nk,2yr,6f8,-3fxy,-qw5,ck6y,-9i1o,1a5n,17ep,-5e3n,3yp6,-6bqm,2off,-psu,5iw9,6i8,7rt,-6l6v,g46,4drq,-6jbj,78cv,-4sju,-f43,7d1,8x3,58z0,-7o75,h46n,-9w5q,-3ikm,-7eu,-zil,4wcn,-23dh,fimw,-kvrn,4w1f,6w1j,-9gf9,-ttf,35db,-4kvz,50kl,4lns,-9fvd,-632,6y6u,3wfm,-163g,-7ddp,20j,-12h3,-ge2,-55h,as8,bunh,-cfj5,7dnu,-5as8,-dkj,2w5,29o0,3iir,-497m,3xlu,3d9,-77n,1dw,-1n0,-1bk8,-56y6,5pf0,-3ngx,4tvh,-5vx0,-icd,5kt0,1ak,-4sqd,-2f4j,6sbv,4ync,-9jjj,36i6,3kh,-18k,-3jua,-1rb6,6t2i,4q6p,-8kkb,-1brg,6lmx,-69pr,4yh8,e,ly,-27w0,27g2,-4w7q,dvp,wkq,-1bzr,26gg,2wnu,-2e7,1wf,-4ylm,181r,-zo8,-gg,2dk,3ti8,-3txe,1p,1gfl,-2zat,114t,4j34,-3q2z,32na,3hrp,-8jb8,8p68,4fvl,-6whq,3od,-11e,bpw,-45or,3wjx,-2n6,1mr,-lad,-1yxz,2g78,-20c,2mth,-5knv,2r5o,-fp,-5ue6,-6bj,-5gc,-u,5czs,t15,-282y,3s,76ra,-57y3,-1yyi,a9s,-2lg3,47jk,5os,2bn,6y0,-gz9,3u2,bem,941c,-ckmx,-1lrj,1o15,36q8,-73s,4ec,3nmw,-3irj,15,-1t,-dc,1ac,-ddi,-1ja,-6gi,-5xh4,5zeq,6dn,-8jn,1ey,ahev,-aggy,-2yq,cgl,-as2,-2fo,-2ysi,2xmm,-3nc8,j23,32gi,19m,-xb,2bg,6l6h,-nj,-6828,-26tb,2ay0,4lyd,-4blm,-4hho,4lbb,1as,-5js,-5p7x,36ac,2nt4,-2yr,-2o9j,-20f,4uf,2gcz,-9cb,-2mp4,24,4vn6,-5zl0,1s4s,7ef0,25,-9t7h,4xny,7tq,-2yde,34uk,-wfg,1jq,-1x7,9q9,5x3,-9kr,-2ik,557z,-5dhy,6dr,-5bg,ak,-1d2,3si,5jc,1gf,-1ow,-jc,4fgt,-4yta,hah,-r5,4v8u,-5c5q,-cm,-71,c32,-1h,-1lw,-589,35d,-fi,3lu,-yiu,-3qgz,a32c,-4ygj,-1e6c,4kek,-2u8v,vzj,-2z83,1l7p,12i,-4kbo,443p,-6x0,5hu,krb,1uy,hsc,1j0h,2xk,45jf,-b40e,4rfo,0,-3qb6,425l,-3fln,bi0,33tz,-2i3,-1j6c,1jqs,-nk6,-11xj,-2l4y,2plh,-twd,257y,-1f2m,mx,2m6l,-3gbv,10dl,-1b33,hllt,-g512,-32rg,6sh3,-8lr,8ll,-4rm1,piu,-t80,4l1i,-97p,eiu,-14l,-6rf,-3mt,-du7,-5sct,bijl,-2paw,-anyx,eopy,-7d31,-5pzc,72xk,-7ao1,cqh8,-d3zl,gqo,c9,-bgi,1p7b,-w3h,-zv,65c8,-6nrv,-2fn,59zz,-f2t,2ows,-79wj,4j53,1n2,42d,-4xrf,fx,99qb,14nj,-5oiu,-6b,-3qg7,3qys,-anf,k33,1wdn,-8p9,-57so,-hqv,5nht,y3a,-tt,-7e7u,60pn,ay2,2ra2,-6hkt,49uz,3v5,-7z2p,6f0o,28nn,2vz,-e4x,-190,-y7x,1a9e,-elq,-2ce,-1wz,1b2,-1nzk,-1oln,3e5,-1lfr,-2az0,9dmg,-6nt6,-19zf,5qyz,1ny,-5e8,-792k,6yfq,-2gj6,-54h1,7x0q,-2si,1sn,-40t9,44je,-rk,-8m1z,akty,-28u2,-6g1t,y8j,5o8n,-rk,-52ra,bwso,-4od3,-56ry,-l6d,-q81,-g,80e6,19eb,-c9c7,-1pz8,86d,3ngy,45ls,-18i6,-300g,-c7d,1cb0,1zi5,-102i,4w3h,-8xei,1il4,-2tg0,7uug,-sp1,at3,-1i3d,-5fft,dz6b,-bhx3,-wk2,-su,1yu3,4964,-6xp,-37,-4qbu,-pvn,1120,1bt,-ksb,4h9p,-4qx2,-t5p,73dd,-7egl,y39,1f93,5t0,-yxm,-2wsv,2hya,65x,623,e31,-3jpg,1bu9,257t,-3vc,-15ly,bpkl,-bku5,46ut,-34d8,1ddw,9ox,-pbi,-nq5,-40o9,dgtk,-a6p3,33di,1pv,-50n0,uwn,le,8wv2,-2z0f,4cpr,-cewm,4p8z,1win,-5mep,2q3x,-4j2u,24jq,bh1v,-cu3o,1vbt,478w,51va,-92p0,-1wh8,dg08,-8v0b,rn2,-ipe,68l1,-90o9,30sl,-3gv7,-c,4cvt,zp,6y,-ux,4rd6,6p0,1c7a,-ac8o,408r,5yiy,-8t72,1urx,-1qaz,c6o,-29zw,1hpd,av7d,-8408,-9et,72s,-b8k,ux2,-6rxq,6tft,230,7z,-1fvq,ukg,-iey,2qpj,-e3,-6o9d,-wrj,236,69cb,-4xmp,iq,4sac,-4g2w,7fla,-9aew,fo3g,-ddzr,-2w07,bibr,1z1,-6xv,-94lj,25,atwo,-ape8,-1ivb,wou,8xj,-19cm,8yj,-9k3,8mn,1bpi,1cc5,rsq,-3t7n,-39y,-nlz,bp4v,-9upm,9kr3,-94qv,3ctv,-11fe,uju,-1wj,jsi,-iex,6pu,azm,78d,-5a7u,4ymp,93p,-oy,7uqx,-7p5z,5tuz,-34fy,2utq,-7hqe,1u2a,-3m5,-3hdx,bn,-ed,qk,3lc4,11ae,-78vp,66j6,29,jb7,-4sk,-5kfy,3fdr,6bph,-4nng,1ht,-570,4dp,-41ne,-18i,dvod,-bwu3,1z5a,-3fz,36uw,-3apt,1jfy,7dyn,-ccs1,-esz,4a1c,-a3,-6cmz,ezkp,-cob8,3f1,-138y,-7cw,5427,-4aul,5eq3,-29r8,-13aa,lyj,1p63,-4gcp,1x,wfi,-3y,-hsc,axe,29v,-3,cyo,91mt,-c0tw,f6w3,25vy,-f6ng,ohk,3fhx,ame,-ahe,8zs8,-8h8l,8g7z,14t,-8njj,26x,87a9,-2vz,6pa,co0,-fobj,18y4,15wr,deth,431,-8qxc,8l5s,-c09p,bqde,-1ei,-ck04,-bum,-18n1,1pn1,2c,cway,-9m74,-1tr,d76,-idg,-5mw,-41j,b48,-a9r,-3ph,nee,3vcp,-51li,1zwn,-mx,4lg6,-4nrv,-3np,-vxq,1ht8,4b,-184c,9b93,-jqq,-9yf6,6ofb,-b0iz,1m,5h4,766,ak16,-47fz,-1beb,-3g27,eaij,4t0,-gb93,59ty,10at,-5xqi,3dct,-4s,-3e1g,ftnj,-10zj,ov9,-938w,71ac,-el3,dvc,13gb,-la,-asr,-1sv6,15cw,-7433,76kv,k7f,-k7o,v2v,-1sjf,1j1,-dlh,rtp,1mrr,-2lj5,2dt0,60d,nf,-cn1,-27a7,1bng,-d939,5xcv,-6rq5,1trd,-1loe,1cl,-cp4,cg3h,-1xu,-4xr,641,9p3,-wyf,8sl,-53v,ulp,-10ib,-5zxl,5k1a,-1lw,9ae,-afyi,agsg,-1qv,5r5,36n,1pf,-1j9p,731,ra2,-167,-93bb,jnx,74f5,-4v5,8tc,-ebd,lq3,ks3,-3096,2sd,-eft,2pe1,4id,-4on7,-14i1,4lmo,19sn,-3hlo,-4o9h,4wx1,-4p66,4zxh,-5zm,-ix3,-hp8,4d5,ek,5cyq,-55i6,-6vg,9bi,-980,y56,436m,-63ox,-xc,h,-1oao,1i1k,-68e,-1evc,1bn1,6spb,-83pg,2gdk,5gfs,-5g64,-nex,1g66,-1jqb,-213q,-c9k,1mbw,2sm,-8m,pz1,1b6a,6gf2,-8ign,5k0z,-4179,-tn,5z9l,-alo0,4q3w,-ncp,1rk,-34ls,7j1n,-3to5,-cb6,3bqg,-3021,-1hum,3z0f,-30e3,-4ccg,11mb,3eab,5smp,-6304,-4ro9,62qp,3sp,-2ck,1rf,-104,1ls,us,-x80,bpn,-fv7,-3d0v,8fpj,-7w6f,3a4x,ye0,-6cmb,1isv,6wiv,-4ad2,-4a4j,rd,552q,-4iah,4t45,ak08,-f8wn,5l3r,-2t,11ps,-2g3v,bak,-isk,20x,69y2,-9p19,e4b,87,ck8c,-4cr8,-4qfw,23du,28h8,1rol,-785w,cif,-6zt,15tr,-b9s,-2ans,-8fo,4uiz,-1wnx,31a4,-3f7n,-1z04,kwo,-ijn,-12g,-1hx,77,-1,2eaq,6xd,8w8,iws,-3t7f,6dd8,-2c,25,-6mq4,3f66,-2xav,-1rey,1mo1,1sm,-b,-8,278f,-3igf,26dr,1h7e,-2gnf,-9e8,-2ek8,1of4,30re,-337p,-2klq,doky,-bun6,59,8ex8,-40zd,-390l,35xg,-tog,10sj,-2pih,3phh,-gr,1ix,-1rcu,57zs,-4tqs,-2vp,5be,-1iyh,2sci,25q,cr,-5h,e771,-em7j,ei70,-iwyo,kke,-36w,75ak,-983r,2l1y,hh3y,-jicy,k696,-fhdj,-5hs2,4u8i,5u0h,-2dtf,-2xmt,2wtw,iz,-1i5v,-16rd,-yz7,-2ym,a9g0,-9yva,6euc,a7yg,-jgil,yrg,-80,-bi,-kn,25r3,-n43,-hht,2rls,2lb3,3q4,-3vpo,67fy,-6qvo,duw,5ymh,-57cz,-471t,4had,-4fsn,2wjh,-2cxl,-1whk,36mk,asw,-2cm,2uk,-3bg,4mtv,-7xa0,39o,7pck,-7ntv,4nt4,1g1m,1our,-2ivu,-74i6,60nf,-2hqk,464g,-1a75,1adi,4ly7,-5yn6,-19pq,59sr,-7jz1,34bj,-48uq,4iso,17v,ufp,-59zp,7si,-f5l,9o6,-8nk,46wn,-dzm,t6c,-43nt,bsmq,-76pw,-3scu,ausf,-8iyx,-2cwt,2dkm,-3weg,50p,-19h,-1qe,4lg0,7lzg,-8kfe,13uv,1n87,6dhw,-1qcf,1ozf,otz,-9mf6,-35dc,-g4a,12pj,awds,-4pny,2p6u,-9tm1,1qx,4mf3,-4fkp,-t0d,c29q,-bf4a,5nep,97t,-38,5ipm,-5vxr,-pzk,-3awo,-16vr,-3z5,-1qm,lr1,19ro,-y5g,-2mg,3dl,79xe,-7i3r,a2qc,-3m2q,14iy,1x,-78z4,72yl,-6n9u,6o9u,-6xz1,asck,-3xl9,-5f0c,5y4p,-yp3,-611o,45l,6g9s,-aao,-4vsy,-48w,3lhf,1m3v,-50xx,3etz,-4msd,3hk,-1r8p,knd,-zj,uk,-n41,7xye,7nr,-1v34,14l6,-9zh,68o,-2163,-b4t,2m4g,-2uk0,-1v0h,-3bg,2120,-5ckr,592g,29m7,-25ks,-5csc,-1clf,1tsn,lyp,30o,kw,-179,-1e,40x1,-41gu,io,-11jp,y79,-1bb,11y,2s,-t9,4on,-9e,-pg,-1mb,-3a,-68,2z2,-in,-81,-1t5,1wi,252,21k,-17u,x5,1j3,-vv,-1nq,-2sh,-74,ur,-qn,pv,-3i,100,8w,-2y2,6qg,-79v,49z,oz,-6o,-553,-25l6,7ai8,-12yz,-520d,1sgv,-k76,3k8b,-3bmr,f82,-2z2,6nib,-4vx4,3t4j,-64nx,7ll,75qi,-2ne9,-10wr,10j1,-2oeq,4g2d,9pnz,-fzbw,1c4,-3i9k,2rp9,-6n6,839o,-80n2,-390,6yrw,2e4,-4jos,5fdj,-794d,et2,4bz4,-5119,7lls,-7rm9,34xb,1jhp,33bm,1xvx,-4y08,hgk,-27gz,-7lv,75sd,1ed7,-3o7f,-7ldy,bsx,4puz,-4xyf,bgb0,144,1l5k,-9z0d,-1us,-2hy4,-hlv,-1j4v,873x,-3581,-f2n,3l3j,1j4,1m07,5jxy,-flzr,9id4,1vx,-941z,bmw,ogy,8aw8,-9bf,-lu5,1rz,4rv,-le,x51,nsd,-o0f,-1q65,16x5,-2adq,22r2,-72fd,2jss,3yce,-bho,lf,-5p,-un,2j2,-pq,i2,-1z5,-26c,-420a,-1uyg,5i9h,-3zkz,-58q,r3,40g,-xz,6zu5,-amsg,5o1w,3gw3,-1hdz,-26kq,-361j,1m58,-2vu6,1j9,5pqp,-5f03,6g99,12s9,-2w0s,-61nq,1gun,-cum,44a1,5y8t,-77j2,-164q,1eeu,-3clf,-4dx,9toa,-9hwo,-1vd4,49ug,4rg6,-6q3n,r,a81x,yc0,-ckf8,gd5q,6kt,-91u,-gdyg,3hbb,25ad,-442r,2hm8,4apt,-6ef0,asjq,-crs0,492k,-3usw,-169f,9e83,-23j6,-v85,o25,1pqj,-7c2b,1jcc,-4aw,4dnz,-3z2l,24ja,-2cy6,1fu,2lfv,-2p7b,xh,k3e,3o76,-34k8,-1ldx,-1kj2,8eg2,518,-1dk5,2bm,77c,j,2r4v,-7joi,2e44,-3hyt,39f,gi,-15i,7lcu,zq1,-3f9z,1n3i,-2js,-6zi5,hgo,1wxb,-3xlg,1wvm,7mp,42m8,-4k3a,3e,93jm,-3xji,-563t,22x,-5kx,3r2e,2ded,-2gb9,-5zbv,795q,-1yi5,-48su,5xv9,-34co,1kdv,-3jhe,a73e,-8jyw,445a,-6neo,5bsl,-4w3w,ce1,-1qre,s3m,3rtp,-19w7,186,-i2g,-18o2,-w2,1m4,-w9t,-2zs,uge,5wcm,-5jlt,2kj8,1dc,-9mt,-1yey,-2bg7,54be,-2ojb,1bry,p56,1eln,-dbi,2rj,g6i,-3x,-b2o,uua,-1uo,bb6,442h,-6851,-1asb,3un,-16si,-3un,66,-1g33,kk9,pw1,-nq2,-5oz,nht,vi0,4dv,1cr,1l1,-1yzz,wzm,u1,-sjq,-80k,5ef,4q9u,-3hmk,4koa,-1uh9,-2jmm,9ud5,-717p,-2uw3,etd,5wt8,5wbw,-3uos,-58ga,-e3x,6cbb,1zr9,-bea,-153a,-1m9,-7m7,-3qk,42q,12tz,-h89,jnf,-2r5,-bhl,-gn4,2iff,g2y,f9k,-emb,-xdw,-5aog,6mc3,-adee,41h8,6a2o,-9laa,br82,-5zb,-4s,-9kf6,-5i7d,-dk4,amhi,-vxz,-d0,397,-7imw,n82,-3nz,9zs,yz0,5a9,11z2,-5rvh,elu,gv,u0v,-2sm,-18em,ryk,-69r,5ob0,-801o,1gj9,bow,q3f,-18mj,ns,12b7,b1,t5t,b5l,-3cy,2axt,-i7s,-2484,-dul,54d6,-3f2,lcp,1gn,in,-1jk,-4do,7j6g,-196,-1z5,-11s,-840t,-1h0i,-1mbf,lfk,d88,4j8,7ya,-1y8d,3bv5,-jsu,1cax,-3ogp,1rbz,3fvc,-3u4,-10l6,1sro,-39a,-9nj,-8078,4lmd,1syf,-slb,mgh,-6r2d,63c9,-j9a,-94x,-2ivg,fd4,3k2t,-1t68,-23rw,2r5m,-4pwl,6gle,-6zjv,3xug,i29,-3col,9bgx,-2sm1,-2u9l,-hq,1di,15l,-1hg,-1w9k,1u3p,-29b6,303,s18,-bw2,-3c0p,2cs,7ugc,-1j76,-36s,-1cy7,-43x8,11x2,4l2d,-1rk5,-3k1v,6xph,-2sjz,-lzf,6e9,-2s1,7ph,61l9,-adok,5rkw,-4hkq,-1goe,15k,eskr,-fxc7,1wwj,dax0,-bxpb,1lj7,4ic7,5f9u,-dvt3,egit,-ev6s,ao4r,-8ne0,44o,a2uv,40,-9zvf,-73i,-crb,1gv,-tu,-108,6mq,2gw9,7q5b,6md,x3,15m,-143,1f2f,15,-70,-sd,-l9,k7,187,ue,1e3,-1fc,1v,-2lmq,-aknt,5o,68wn,-2172,1rpp,-kba,-38it,kbx,26yi,-174s,-7bl,36,-1m7q,-3jcp,6x53,16c7,-e5,-6jq0,3r7t,-19,3j9,-2szp,ylg,-qb9,-1kqx,ds88,-fvl,-bx,-7hg,-26xj,-50ka,-670c,5ir,3xh4,-2wg6,57x7,hbi,-5tp1,-ua,5h4y,8l,yj,-14j,-143,-4u,v2,15w,-4ta9,7sn4,-31of,-53rc,1fv8,-1qd4,-4oc,fj3,7vv0,-a5wk,2oqh,-1xs8,7f3a,-1xcp,yi1,-6wp4,148t,2boo,-2kri,-cyo,-1ha,10ho,-er6,67md,4im2,-9stw,9x2e,-2ldk,-7d40,585y,43v,-7v1n,5zmt,-4c8m,2wj0,2g9k,-4af7,29ds,-3g3f,6g87,-6g3o,530,ny3,-3rd,-xmn,1m5q,-inn,-br,-rjj,-848,-5f,guy,-wx,1m9,-1co,1vvt,-2j1l,8en,c38,25t,hhu,acb,98,-2wd,2g6k,-4hom,4fp,fg5,-6y7,s7u,-p7e,11i8,yd6,-u4g,o83,5lv,9r,ds1,2gmb,-3zkb,3xtt,-5bv,-5m4,-6zg,-3wp0,42kl,-3c86,-9sn,51i,-2mt,fz2,-q6,-92h,-8u6,4bt,-d85,w46,-100q,b8q,-138,327,60z,-1ve,-cjs,3ze,-1ccn,dxc,1jup,-b0f,8q6,-j1z,143u,-76b,138o,-590,5ku,20ii,rfc,55t,-3weo,-dyj,x5,crl,4xcj,-21wl,5p,-2jvs,2b6o,203r,b3x,x,-7r,go,-65do,22mj,-1hru,-1l5b,2p6g,-fpx,jsc,d63,1aa8,d5w,-37ii,gpdh,-7pw,-g,luf,-2d2l,-2xc,-enec,x0,3h10,-425r,cnc,3go8,-3g9m,3f90,-33qd,3iln,11f7,-o0a,5qu,-2kz8,-1g4g,3pki,hj5,-y3,-48cs,3v4k,-3v8w,3hah,4rc,gn6,-3dg,24b,-1b2,4dt,-foa,-3ts,-6yl,-3hm8,40cr,-ck,4o9,6gj,-3mc,a70,-4ig,1t4,-43ez,zvg,-m1h,3otx,-4242,3ovf,2o7,-7b,-2j6,-er5,px5,-42fb,13b9,9w4,18r,6m1l,10ip,-92kl,9m4i,-arz,uob,-2upl,2dt5,-6b,41ik,63f,-1n1,n2h,-5s9n,-2vc,-gj9,kzg,c87,-aft,r6y,-bdk3,2hk8,5pz,8yb9,-8l2a,-fo2,780t,-62iu,-13fj,2qrr,2kkg,1su2,-8slk,4sh,1xqm,1e93,z08,1p4c,33g7,-7uwv,17u8,-z65,6r6x,-1zee,4lk5,-9tw2,-1ftq,-863,7ak,2g4,-1bek,1qj,-gc,-5mt,6g6,-yf,450,-232,3nl,7pf,4yc,-bsn,24d,-1fx,4m8,2j35,ysr,-3a5l,-75m,3kh,db2,-824,5pm,dlh,-66t,-4c6,81b,-f3q,-3h5,4a8,-55k,39y,mt5,n5,-1w0,47q,-gek,-2pi,vhw,-1og,3pl,-5we,-9f6,dcv,-j0e,-kvz,eusx,-3m2,-62e,-7l4,-54s,12bw,-boj7,-17rh,5qh4,-2pdp,4a1f,-7g6t,21v,9lb7,-1vdw,cj,-2ugj,-ly,-6fg9,23s9,2e31,-d7,1rn6,ncr,-5m0x,7ow4,-76a7,33q3,8yya,-5hxg,3f,29v,-5t56,-283t,za2,6i7d,b9n,-1nru,-1c6i,-307q,3dwx,bo1,-4a91,-sta,1uxo,1cys,7696,-5o7n,-4gx1,4hap,-byu,-3gh7,u4c,62xf,-3376,-37fe,8zjc,ifg,-alti,ax8,axfy,-4es0,4tk,yap,-4rzc,-1mo1,-qlo,7yj,5w1a,-6p9a,crkp,-6eif,-2c5,-8sp,3gv,-6r,7g1,1bsb,-2irz,-23yt,-5m67,3fdv,-y44,8b1h,-7r9q,-cdw,4cb0,-1l61,-kp,1xwq,3,-4jxp,-1qkw,1p2n,-2dr,7b97,-8osz,1exb,44p4,2i1c,-3ekr,1nqh,7jjx,-cd5y,-ak5,49dy,-3e2j,-6of,8yh,6ji6,-7njv,1g7n,-g4c,-61f,265,21n8,-25dz,-ni,5ty,fiu,-94t,148,-1lj,-9lk,40fe,-6nq,16y,-5krb,69ds,-fbs,-5enq,3nhc,-2e7s,487f,-1bil,15gv,-589,h4,1wsj,-1y4k,8kxk,-8p8y,3aqv,-7ltb,7lko,-2kq1,-gau,vw,-e,-3uv,-5z1p,6fem,2lf0,11t,-11s8,12ya,-fiz,gex,1qn7,-59ez,-3xu7,-16p,12o3,-2hxh,11x,-1gv,e,at,-21l,y7,1t8,30,-g8,-3x1,2yye,-31rt,1mqh,-2tp,4285,1wk,1udm,7gk,-236x,1ct,-ch,324,-15q,-3za,-zm,-3ki,s,6hg,12u,-3kyf,41gk,-epz,-1ji1,3cpr,-2yg1,31gr,-2dck,-1m3i,4dm1,-4jt6,-1zcp,a03r,-3j93,-6int,4qwa,3qp,15ej,-vvu,-4rls,80bk,-dj,10zj,-z4n,4gvc,5bl,-68z,-7rh8,1e7c,-6xxc,8aec,-8a6,16y,-7tu3,8ts,91d6,-45yd,ud2,-idi,-14w,-10j3,-7f8,-3ik9,-5ij,-ebu,4xq,cjc,1d0,-1ik,b30,1eu7,-2502,kod,-z3,5p5,-7l,-gjk,-8n1,-217,-68b,155,-5jv,-2jp,6yg3,-14l,2cs,-46l,-5vl,-4dj,-2nws,37i7,-6oxk,7dxh,-3mbl,2603,dua,-a6t,-349,-2,wlk,-zx,33r,-1vpc,2jaf,-1nud,-1w3q,-bzc,-33k,-24e,-g0a,io0,38c,-4r8p,3yec,gow,1co,-rtz,-5d7,-m5v,8vd,oky,-78s,-3h0,-21,-2fhb,w,58av,-5u6r,3z5v,-4xk,1rl,6suu,-5onr,-803,-2wqq,-1bw,t3,j0,1lx,-1o8d,gr4,d6x9,-4hbg,-6wxl,4u3z,-5jwj,-eg,-j7,5mn,-12u,1xam,-17k6,-i2,-4kq,-40s,-exa,-9l9,-73x,qb,6zvj,-71zj,730l,4ntx,-2jv7,7hh,873,-9t1n,bkqx,6uu,-bjsr,-2y,7ukz,tfn,-9m6u,1vd3,-46,-v9,-iq,d9y,-4z,13o,-3wc,-ul,37u,-y8,jd,5wv,27t,-1f10,28b,4ft,15xj,-lv8,6z,1do0,-3e7s,18t,2oj,-1o,1f8,211,1x0,6f4,-up,-1yl,pj,7esb,-xq,-2m3,-86d,2xyi,-3ra,-jux,5lm,-2fk,-207s,-5pwa,7eo5,-783,-1cf,-3z8,53f,-61o,-75ie,44u,-2g2,14p,ol,-rq,ae,202,-1oe,-9zh,-12l,-9q1,1il,6dpw,1ppu,4qb,5e2,1uix,-3p1,-gi2,yyz,8w9,s2c,v3,264,4wx,1o7,812,-3pa,-tcl,98g,lgg,9t,-84y2,-en,1n3,-4nm,78pc,-7wg,1aud,-jrq,-1ql,rs,72a,6nw,-if7,q46,-24u8,-inr,5i3,-18n8,-9krr,33f,3nsk,bgp,-9qv,-1o9,-4exj,3ll7,1j0,-3vl6,2qux,-2qn0,-51g,1qc0,24b,-1phl,18vv,x5l,-2hsg,-25f,4rfd,42bi,-2plc,abx1,-gkhm,-1cr,2sc,22,2t9b,ful,-3dok,18r,25x,-gt,41yr,-2sxx,7s3,-1a1b,2mob,ppe,51w,-1zgz,25ss,-f6e,-eap,irl,-2db,-6by,-fh,1hd,-wbv,8i7,-656,hq0,zxy,-2iu,-602,dx4,-uka,15no,-6ph,-34ra,-1ik,-gq,5z,2uph,lsm,-b0s,-5gu,-1os,1iro,-2x21,-tu,h9q,-1p53,36q9,8gub,-9mf5,2g8g,-4p8z,cw8g,-25y,-hr3,yrr,-ff03,1wm,bhh6,5a4,-8ao,-1uj,-4u4t,-8i,-2n7,c,-fd,59,-1rt,mga,2lax,-79uc,cclr,-1udv,5k6,-1ad5,-99ff,dgvl,1o4n,-9lfa,9a1u,vc,5q5,-1mj,2p,-7kzh,8q8u,-axl,60d,kd3,-43d,1oc,-624,-b8a,-9quj,-3zit,3xmg,cydd,-xwc,j20,-s64,1xhc,-hdcl,-2uxn,1tq,j7,112,-1x8e,1yr4,17k,-2rmf,-4yf,-4u2,w4b,194k,5ksf,-5tm6,3ucm,-2u4r,-29h7,-1wm,8y1,-4nl,3gd,22iv,-j5d,1qs,4u9,-1t,-993,axt,apk,-2655,-5lp,5n0,47l,1y89,-1sdz,29i,5i5,1hvb,-wt,9zfk,lkf,-b6h9,3lja,2ejd,-6jys,pse,5f92,pe,-248,-4lxb,4pkc,114,-1k1,24,-am0,-d4a,-1ct8,4t7,-15uw,-1g1c,-1b3,3dv,18w,-1v5,-29w,lzl,-mu0,-6a6,cx7,-4ox,-dv0,a47z,-7j4t,2g9c,1gdj,-1def,-fy,24z,-5eh,44c,-305,-x1,-hyd,-3hf,ww,-3w6,vn3,-4vru,50u3,-74i,-1qlf,-3f3j,51uv,-5b9o,-9zv,tk0,-o4b,3xc6,86n,-3igg,3n60,s08,-8sd,-ei,ia,-4id,-2mi,-du,cm9,-c0,-au0,3pi,1v1,gz,-144,7ni,-cjk,h5,17gv,4few,-2rin,-26rp,-841,41t,-237a,-2pdi,21el,56n5,-7kue,5c0l,2l,3h0p,-7fud,1kl2,ky2,j8i,-rq2,-r7,-2a5,115,-25u,1m7,498,-8sp,6viy,-1s9f,-7xkc,729,-e2v,3ob8,-1do8,1itx,-6,38k,-192h,ous,r7,1yb,7jp,-rmv,-b7s,72q,-g2,-30e6,370,67t,5amt,8pif,-3w88,-19mp,-pit,a0v,-8cl8,2pw,55jz,fdu,4qu,-rwi,1iy9,-3s12,-2iyz,-2ov,vdh,-1vsm,97l,-nd0,2t7,2d1r,49o,-a02,-7qi,-ek8,811,tl1,2u1,-7s6,-4xf,-1lt,-p13,9sp,d96,-uq,-ud8,5mf,-3pu,163,2r9,-29,23c,-231,3cu,-2fqo,2ls,-1wv,-d93,7lpu,-76c5,7e3d,2dw,-3b1,-2tb,-3whw,-guh,-3rh,-2z0,18xa,-1030,kmk,-3sh,1eyv,-1r2t,t78,bi5,1ewc,-2yj0,53v,3d5,-7is,57m,de,5gv,13zs,-a3i,2xp,-wm1,-brp,60l,46qt,-35v,-roq,ztb,-46fb,-1a9,-4q8,2p8,-18u,9kzg,-6e1p,-2ynm,-gfl,26z,z0,-jqh,4ca,2hb,1veq,7pw6,-8cb,-dbv,tmo,1b0x,-ca51,4jg6,-3gae,87x,-19nz,19eo,14h,-3q7,5d9,-xv,-7ys,-1i6,qj,1ry,-3wc,4p8,1hd,-o4,-2mq,41,2kd,11c,-ajh,nd,k3,1jz,dcm,-8jb,6u1,ke,-8cj,2gt,tx,5eo,9a,-86a,a3l,he,-3jt,-63g,j77,-5nm,-1bb,8fp,-buf,1ru,1z7,-1jq,-o,1qv,-67s,2aq,7ac,-2nj,5qv,-u7j,8b4,2a9n,1m1,-k0t,-sop,-41r,e4q,xq2,-1h6r,3p1,d8,-dui,-bhk,-i7,-19f,kb,-1lq,18h,-1kf,1f5,39s,-84k,-22b,hhl,1zva,o08,qx9,t9,-74xb,2d4s,17un,147,-7bh,8w,9i,3z1,7,io8,-bq7,-baf,-2dbv,-4g7,-488,-d03,4xh2,7sv,-39dk,3ro6,-g0,6zth,-aioq,40wm,17hg,-5xd5,-5xz,zl,-1gz,-g6,1uc,16y,-3wb,t7z,ca,-al,87,-1dn8,-5r,15,1e93,-1gvj,e2,mh,-191,4o,-o6,-qv,12i,-g9,-iv,11,4g6,-5rq,1n7,-3gt,81a,-1i8,-dj,-1y0,1lja,-1lgp,cjw,-4im,-23i,-m8,-14y,-dz,-fcn,90b,zn9,hmq,-1e4,9db,gp,64mw,-62kp,-et,-3ca,-owr,dfe,2yc,-x2s,-16fk,43,ti7,6kr,-6gv,p2,egos,-e23b,op,4af6,3a6,-u4l,-20e9,18ua,-jr7,59,-3zg,166,6sq,1mq,1wu3,7g,-2gb,fc3,-21n,-4bn,-108,-14n,w8,-5iyh,f4md,-c3de,-e37,4eg7,-fm1,6gj7,-7kjr,-4aw,8ei,m1z,aky,2k3,4v5,-1ow,-1ci,-13l,359,4ef,-96y,-3de,-1g0,nz,-a6,-tz,-19kq,-690,-h3,-2m7,fhm,-gz,1l7,1jw,11q,-29m,-dx4,9xm,-16t,pki,1zl,-2k4,42,2z,t7,15c,32,-1j0,3pl,vp,-97,-45,-2d2,1ge,-1j8,s6,3,-w9,2uz,-4ak,1981,-1e,3vq,-aa0,-3hg6,42xk,-4w95,4fh3,-2cxu,9glz,-bknw,-263,4vug,-48i5,-f2h,-w5x,159t,4owf,9q,3nq,-16h,-eqy,-39o2,-156g,c1h0,-ch2o,7srx,-73zs,-4rk,-2tlu,u04,-btf,aa,v0e,f1h,94p,q7,-lce,5z7,5u3,11r,a03,a4e,-mco,hio,-90e,-1mmf,1zik,-4vu,-uox,-j00,hzo,v9n,4hy,bdv,fuc,26l,-5s6,98x,-fsy,1gr6,-1kda,30k,hw8,56l,-p4f,e8y,-kkn,swp,-dyv,2no,41z,tk4,-1eel,9ks,xd5,-189w,34v,hfi,-i3,2gy,-pli,-128,ijt,-epb,jhv,-eup,nit,-rag,-xk,-2zz,89j,16sv,-8xg,bgk,6uf,-5vh,-30u,lx,6x6,-7rs,57y,-cub,gdj,-di7,-bex,mzm,-ghm,bva,3ad,1fdy,-6hq,9dk,-7vn,-nxl,4tk,c4f,eet,-cof,2jp,-fmh,px9,-8cx,-drf,2g5,2yd,b67,-uyn,35,-c8b,b6i,-7cd,-29e,938,-2zg,5jm,-brw,aob,-7zb,po,5c1,73,-vq,-8r3,-1l9,zt,997,60y,-amx,-3lz,8ra,-3hs,d38,-er3,545,9lc,-ex6,jx5,-7n4,73d,-9oy,5qz,gz3,4wa,1xz,-efq,-180,ihw,-eaq,-2ek,4bo,3uj,1ud,gn,-b52,das,5g7,-d4y,6fl,-bb,-47j,dox,-bi1,-9el,13f1,e0,-h2o,2tt,nl5,-iq9,-3kr,qga,-mr1,904,-fsn,nmy,-gh4,-1mx,3v,ph,fmm,-tb,-izr,uxj,-ghb,-fp6,rqc,-dvn,167,-gjq,xh7,-a5l,8sp,vh,-4cu,-kcx,-6uc,7yz,eae,-h92,wi,72h,-d72,914,1s5,4w3,-9nt,dc9,2ib,-pzb,fdd,bl6,-bn7,d7w,-s8n,r0q,-2uqi,hyjy,-e3po,7da9,-c1l4,y,3wfi,-3u4n,832,-dly,-gva,dkj4,-cc47,-6qa,-1jq,76zq,-74oc,-sk,-8l5,8gn,-1xtk,-4mg,bre,-38a,2h5,ch,1tmm,-1jrg,1nk9,dy3w,-yhu,-2e7m,-1vf6,-j3,4fs,-41a,-8ob,-aoaf,3yck,4f80,4y7u,-5eg7,gp,-195,-ks,-6dcv,-3hg,-49,2ty,611,2q4,-5z,ik,2k5e,3rqy,uo0,-u8,-qd5,-35q,-ugj,1jme,cuo,-ayc,-es,-vw2,-4wyl,53ws,4m2k,-2zo,-39vn,-3fgq,5krn,14g,-anxo,-4k7,72i4,-7bvy,7eyx,44lz,-3eyh,51re,-14e,-7nyp,96m,-4qtc,7g22,-7m4j,-chz,d6j2,-594p,-3slk,-3w9w,deq6,-6vyq,-65t8,6o,nm,1k2,-h6,-13x,5r,oje,-ck1,-81e,-11e,gvi,-1pb,5et,nm,3g69,dh,25me,-6840,60yq,-60wx,-zb,-qir,bird,-4sl6,4zhq,-3lb9,32c9,-3eid,ls,5icv,-cwqu,cw15,-5wm2,-dhw,sen,4k0,-7ip7,74mm,-796u,6yze,11e5,-k1w,-i4e,-8gb,eit,-7mb,-ekm,gjg,ini,-zk2,784,chp,-3s,ie,-nwc,642,ix,t93,-690,-pnq,-7sj,1j7,jkm,pba,-1jhh,1lk,ym7,-fs4,cgn,77m,n4a,-w79,w1l,-qby,-44c,-13e,7j,bs,-gl,-11g,-18h,1s8,-12u,-1w9,3hg,5jl,-10h,-45n,-99,1,-3zn,38w,5o0y,23k,60u,-5rmy,-10u,-6hc,-ash,-6ovl,6nm7,-3t3,9x1,-14a2,2bva,-2oh,24o,-te1,-1pt,-563,6kk,5ybp,-7lxz,1r,4pu,14m3,2gs,-2zsu,ddf,w7h,87pv,-9rcf,xan,-ct,-3n,-4qr,-1agd,2ss0,hgc,-1peq,a07,23q,dp,1n8,12bl,-10pk,-1ue,-gz,13g,-196,1h3,-a6,-3mm,3d,41y,mu,-fqq,-170,ii,1j65,emg,6mm,13a,-1he,-17b,-6t5,gii,-6eam,-7ez,-rx,3zex,1j5s,4dc,-199b,2enj,-5ho,-1l7c,2bhu,-oqj,8eo,-16a6,12ug,57l,4c9,-drp,18u,ri,f68,-2u8,jsl,-13ry,14tq,-69w,76n,-3ti,ab2,-1l,-76j,-kyh,4b1q,-7c8p,6,kg,7f94,-caf,-3sve,-56k,2oj,3sxf,-3rrw,-7b7l,8zo,723q,-77yk,1hul,-2vlv,8drt,-29k,-6nns,1da7,-14um,a83s,2f2,-8vsv,-1c3,8hp6,-9y46,9pp7,-7um,-332,-4t6,-lsc,cxl,1aod,-7pwg,5q1a,-ae0e,49m,1ix9,-46h,-cs,5ym,ys,-7k9,-4e,96q,jp,224,1kt,-1l,-10,-8kv,a1nr,-b930,72bt,-7akc,-1ar7,34,8ur,-z2,9i,1vd3,3lx,6mi,89nv,-1gtb,16uj,-5o1m,1sk8,-3cc,yfz,45kk,-9fhd,4yru,-1mpb,35q5,-5x5n,-bt,-bs,t4,-op,6t7e,-1azi,-1wy7,wkc,-4pv4,a21t,-9qd0,904b,3yc,-56z,36b,6je,3ng,-1qpu,4ubc,goy,-cp7f,6e15,6o,-6p26,d96x,-8831,-4x7r,4pue,2rrd,-7ho4,6ji8,-1y1,-6nz0,41w,-1g,-1xr,4dt,3bzd,-3bgf,dzrr,c9t,-eooa,fn,sy,1b2,k,tf,-1hz,-in,1r3,-6ad,5biu,-66,-56bc,49q,-7lc,-i,-p,drr,-3n5,s3,-3x6,kd,qp,13y,9am,1w34,2abz,1fv,-4lm3,7n9i,-2fex,nfv,-5q,-54h,-pd2,-j4,d5d,14,71,-5wf,uhh,-o5,-60nl,-ed,91f,l,-f,bk0,4k1r,-fqr,-dq2,8tyr,-csck,-85g,6x2t,-6qv9,78p6,-ggf,-3m2a,-32rs,3oeg,-44ms,xh3,5tmy,367j,-45vm,-1ozs,1x5y,6d81,-1e,-5vue,5zmm,-6444,9b,5x1n,-4ko0,-p,-1v7s,4d,1uzx,-vqe,4j8o,-8oy9,3dfn,7319,ge3,-6uwl,-4uyf,2npn,1u6r,-2a97,9124,-8t2p,5kv5,-5ke7,43,pad,5qn,cc,-1zf,1e7,16gx,-1cw6,-e,264,-p,-3ta,hhn,-c8h,-ye,-2e6,-24w,7tu,1ef,-n8,xm,-5g8,-sc,ri,9qy,-qgf,-41jw,4jai,2cf,dm4,-22y0,-39s7,-1b9u,69zs,-4zps,-c,-26j3,f47e,-60p2,-683,-8583,a9yg,-8imq,-2h0,-1atu,7nhl,-6j6p,62sf,-7pf0,1j2b,-bll,4pjk,-23au,1ab,-113r,36dt,-4ac3,-2b9,axy3,22hc,-50lu,-6rt5,3o77,-75,-5cfy,5ble,-4h4x,c9ug,-ewl,-14,y13,-14e8,-3f,-2ue5,1t,2k,-4f05,-bk,2iid,-12y4,-1gka,-3mn,1so,3lr,-4xnc,8nr,4n6,-1ct,-12jn,-31,-2j,5wap,-1a,-h3d,-v5v,-9,-3e,8zrs,-3k7p,-2hf9,-6qf5,2pz,9993,-4qv7,-3la2,8fl5,-321w,as1,-4d4s,6d6q,-dvo,-5vtk,2nuh,2bjh,-g20,-21,-224b,-22p2,-48di,19,e6za,-cpnc,64u,-1m3,-w,-2kh,jo1,-j40,67,-16,-cq,b6,13o,-1sv,-n2,9cm,jb,pt,18h,-i1,3e,xv,-19i,-4j0,4yg,-4n8,-bf,1pl,lq,c27n,20s,-btol,-9xg,523f,-vk,f8b,spj,5,hh1,-17i,3cwt,-3oc9,jm,-3lf,6u,-1v4,-m0,127g,-5r8,10a,gh,7i,-6y1q,abtw,-btio,2n5n,1zsm,1i1,-26rc,r,-1k2d,ib7,3wlx,-6u1q,7g06,-w2,-17t,-5f,-mz,-11e,-uw,ey,vg,nw,1nd,q7,-1sx,29,6,-mo,9w8,-9mt,y2,4e6j,-7pvn,-zsg,619r,4i,2nxh,-98gp,-9ll,-at,-2vk,-26i,a50,-e4d,97wa,-a03n,3mq3,e3,2c3t,-43wc,1sof,-dz,1lu,42,8ud,tjc,109,-3rtw,402v,-86w,fl,1u10,-1kmi,ksc,-u7z,1xz,ov1,-6rzf,60jj,-535,486,-41ap,bc2c,-kd,-7ovf,jo,fsp,-96o,1jhh,-4yw8,3eo,3k0e,-2c,-jo,2qz,xo,-t5,1h4,1om6,-5err,3v82,-5tu,-av,-l7,58,88,1w,-6ab,3ur,-3uoj,413d,-23,25e,-3wm0,-i5y,-a6,2iw,-74f,-12,-xck,5kpr,-5ku,sn9,1vq,-2aic,12,-l,-12sq,-3j,aej,8pwb,-2d1,-6qfe,-1ned,7,2h,3o2w,2oz,-1ew6,-46xu,58,-1fa,-11e,3zrm,2yi8,5ck,-4,-3c7t,-3qi8,3l7,3jhp,-1cg,8ros,-cc06,-9v,2df,-bn,-2j7,-4c9,dl,-3cf,4r7,-g2,2g9,-108,-433,-n,8i9,4n9e,6ts,-12,4i4,1qp6,-1rfz,-2a,-4iw4,v,a9qw,-jm,-c4h7,m3,1k6t,4lg3,-qa9,-582i,1o4m,-g3b,5b,-12r,-1fo,-96w,5zz,54oa,-56yl,-mx,1w7,11u,1pi,-1gr,2k4,-in,-in,-8f,-aa,emt9,-j5,-euy4,-3qc,-zbw,-7x,-7z,b6,ci6s,-bazc,-sv,-t5,-u9,-sg,-101,-2qg,d5sw,-cvdr,b498,-bhae,-34z,-15o,-11z,-lb,atg,-of,87d,-zb,-15y,12z,wh,-7am,-19,7k9,7v,11b,138,1mk,-42r,-ds,-xh,-2bh,17v,-2r4,z,-k,-3,-1l,-73,-19m,-1lh,-2o6,of,-1sl,-3r5,9zb,-8y6,2,5ffu,-5dqy,-3mn,-5v,-64,-7d,5,-3kc,k0e,-49,v,ku,-4f,-qu,-8z,-ho,-10,i7,-160,-15r,-165,-4ru,-p1,-2m1,-1oc,-tu,d01,-1u4,-1wd,-1mk,-fn,-58,-5p,lt,-b4,-cv,-o6,gw,-1h2,b9,6v7,-ah9,2fm,3ro,3vk,4bz,185,j8,73,bv,ei,-2r9,3xa,-1bv,-7jm,1jxy,539r,-6fpd,752,9fac,2vn,1en,-4oao,1mxq,-38n0,pvq,-c9,16n,-vt,46wl,-6yke,-3uyn,-9j,7f6a,8,-2xk2,2m92,-1od,6vds,-6s67,-4xd5,7feq,-25qu,6hrc,v4,-2sb,-2gdv,-8g55,-w,-u,-p,-3wu,-a,16,11yh,-rqz,-mii,-1t50,5at4,-3m1e,4au,3vd2,-g6,-n2,-44,97r,-23q7,zbi,-3m53,-m3k,-1gn,1gnm,6jbc,-4jeb,3jj5,3n1b,346,6w,-9m7b,1g,-12uo,-1bw,-8s,-1i7,3pdr,3xrr,1pq,-2db1,3a,2eqb,-3ej,1sdy,-3i0z,3n8s,-rh9,21n,-4gum,-31f2,-2i,5h,-9h2,4tls,dw,-4akj,6xjh,5f8y,-c3n4,16,-s,ag,7b9y,-3i6h,-15,21p7,32wd,-95lj,22vd,78m7,-76mk,-1jp4,-59f,svi,-2rju,1ktb,vk5,778,-1snd,-17hk,60wg,-22j8,-gy6,1h9v,plb,4ysu,-4av0,acra,-enpr,4qq4,-4qqo,-jcm,hc8,3ntm,-b67,4w8b,-a5g1,1u7y,-202p,-r2p,-22h,6p2o,3aud,-7z8l,5ad2,1464,vhh,22dl,-6372,-1xgy,-rbf,3wf,4ch,-hxb,3dxh,3wq,-56j,-8aw,-2mdi,2j5g,-buc,-e22,26zl,-4dnu,4nrh,-4nlp,-3u4,7gnv,-73gx,3fdx,-43w1,-2ktl,37jj,c2v,4uy6,-5lp0,4zpo,-4pqp,49ld","v":"0,0,0,0,1,2,3,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,2,2,1,5,1,2,2,2,1,6,7,8,2,9,a,6,6,b,c,0,d,a,a,6,e,f,7,7,g,0,6,8,8,0,h,a,a,a,a,8,1,c,a,0,f,8,0,2,0,1,a,0,7,f,0,0,g,g,0,8,c,0,8,0,a,0,0,1,6,0,i,a,a,a,a,a,a,a,1,1,0,a,8,g,f,a,j,6,a,0,6,b,a,a,0,a,c,0,a,6,a,f,1,k,0,a,2,a,8,0,a,0,a,6,a,a,a,6,a,c,2,c,c,8,a,h,a,a,7,1,f,2,0,2,0,e,0,6,l,2,2,7,a,0,a,a,6,a,9,2,0,m,g,n,a,6,6,m,0,2,0,0,a,0,1,2,a,2,2,0,2,1,6,a,1,j,2,2,1,o,0,0,2,6,0,0,c,m,a,2,0,0,a,a,m,c,c,g,p,a,f,6,c,8,m,a,5,2,1,0,7,2,2,a,6,q,r,a,6,0,0,0,n,m,0,0,0,9,1,2,8,c,a,2,2,m,1,1,0,e,9,1,a,m,m,0,9,9,2,1,m,f,m,s,6,0,a,0,2,1,t,m,m,1,1,0,m,f,6,9,m,a,9,2,a,a,a,8,1,a,9,7,1,0,c,7,6,a,a,0,a,1,b,2,6,a,2,a,a,6,0,i,a,1,1,1,c,0,2,0,t,6,1,2,a,c,2,g,u,5,2,a,d,6,8,0,0,a,f,0,1,0,i,m,a,6,a,a,a,0,0,6,0,a,5,t,n,g,5,d,5,0,g,v,0,5,a,6,1,a,a,6,u,0,w,c,0,5,i,a,0,6,j,0,a,c,a,a,a,a,2,0,c,a,2,m,2,2,7,a,a,a,a,c,8,c,a,8,c,x,6,c,2,g,0,0,a,7,g,1,g,p,g,a,8,a,y,a,c,1,0,0,1,1,z,1,2,8,10,0,1,1,1,1,1,2,0,m,b,0,a,d,11,c,a,j,g,1,1,a,a,0,a,0,1,a,a,6,0,a,a,6,8,2,a,m,2,0,0,m,d,a,p,0,6,m,g,1,1,12,m,m,0,a,8,13,1,1,0,0,0,0,f,2,1,9,d,5,0,2,g,g,a,f,2,2,1,0,0,a,b,2,2,1,2,e,6,c,1,t,c,0,c,0,a,0,6,d,f,5,a,a,g,a,a,0,b,a,1,a,a,c,0,a,1,0,1,d,a,a,0,a,0,0,2,a,c,c,0,2,e,f,2,a,0,0,e,c,1,i,2,0,0,14,a,5,a,2,2,2,g,d,2,a,c,1,1,2,2,2,g,0,7,a,1,g,0,2,0,1,1,1,1,0,a,1,0,0,e,2,2,j,1,2,2,1,2,15,16,a,m,1,c,c,2,2,0,2,1,c,9,2,1,1,1,a,c,0,1,0,c,1,1,a,1,1,e,g,g,17,f,2,d,1,1,2,a,a,1,2,2,1,1,5,2,8,g,a,2,0,m,c,a,1,a,1,0,0,18,1,j,a,t,2,1,x,19,0,0,a,0,1,0,2,a,r,1,e,2,2,t,a,2,1,1,e,a,a,2,2,a,2,a,5,c,2,2,2,2,1,0,2,c,1,t,2,2,8,2,1a,0,2,f,f,f,f,x,1,1,6,2,a,2,2,m,1,2,2,a,2,a,2,v,1,1,1b,1c,0,e,0,2,0,1,e,a,1,1,1,2,0,a,a,5,1,1,e,a,2,0,2,1,1,2,a,f,i,m,1,1,2,2,0,0,m,2,0,2,0,1,a,c,2,2,m,a,a,a,a,a,2,2,2,2,0,a,2,1d,t,0,2,1,1,8,1,1,1,1,1,1,e,2,1,1,8,2,1,1,1,1,1e,f,2,1,a,2,c,p,c,2,0,5,2,j,9,a,2,f,g,g,g,a,g,m,2,a,7,g,g,2,1f,0,a,1g,8,f,1h,a,6,8,f,a,f,a,a,0,0,2,g,5,a,d,1,a,a,a,2,0,2,0,2,t,2,2,2,t,0,t,a,t,p,t,1,1,2,e,2,t,2,a,f,1e,1,2,0,1,2,1,1,5,2,2,2,2,a,a,f,1,1,a,2,m,2,2,1,2,0,1,1,2,2,m,c,0,a,f,8,a,a,a,0,0,2,m,2,m,c,a,1,8,2,1,1,2,1,2,0,a,1,a,a,a,0,2,p,p,a,0,1,2,1,0,2,2,c,1,1,a,1,a,d,m,t,6,0,g,n,a,f,1,a,2,j,c,1,t,2,a,f,j,1,1,1f,7,5,0,2,a,c,8,a,a,2,2,a,1,5,1,2,f,f,f,7,f,m,2,1,7,m,1,2,1,a,2,a,5,2,t,t,2,2,0,1,1,5,a,a,a,t,2,2,2,1,5,1,a,2,2,m,a,a,a,0,2,a,c,0,2,2,a,a,a,0,1,0,1,1,1,1,c,1,0,1,c,m,1,1,2,2,v,c,1,1,1,e,2,5,1,1,2,2,1i,2,n,1,1,1,2,a,2,f,c,5,n,5,a,1,5,2,n,9,2,2,2,p,0,t,2,9,6,2,2,9,2,1,1,2,1,0,c,g,g,f,c,f,2,1,t,1,2,2,a,a,9,1,2,j,1,1,0,a,1,1,9,0,c,1,v,a,e,1,a,0,a,1,2,1,a,2,5,0,1,2,5,1,a,a,2,2,2,1,a,2,c,f,1,n,2,2,2,1,2,0,g,0,1,5,1,a,1,2,2,1,1,5,1,a,2,1,1,1,1,2,0,2,1,2,2,1,b,2,2,2,0,m,1,a,0,2,a,1,1,a,a,1,a,1,1,1,1,2,1,1,2,1,2,1,c,1,1,a,1,1,a,g,1,c,1,2,c,0,1j,1,5,5,5,5,5,t,1,1,2,a,f,m,m,2,5,5,5,5,5,1,1,5,5,1k,1,1,c,5,5,5,5,5,5,5,2,2,2,1,1,a,5,5,2,5,5,2,a,1,1,5,5,1,t,t,0,1,1f,1f,1,5,1,1,2,5,c,5,1,m,1,2,2,1,2,1,5,a,2,1,1,2,1,5,5,1l,1,2,g,1m,t,1l,5,t,2,a,2,1n,f,2,2,a,2,0,11,2,9,0,2,1f,t,0,m,1,2,9,2,2,c,18,5,5,2,v,t,1,1,1,5,2,0,t,1,1l,a,t,t,v,5,b,6,f,f,e,a,t,5,2,5,5,5,0,m,1,t,n,n,m,1o,a,2,1,1,1,1,2,t,5,5,5,1p,f,1,1,1q,1m,5,c,5,5,1,2,t,a,2,t,1l,1,f,1,5,c,0,2,a,0,2,2,1,0,2,1,0,a,1,1,2,a,1,2,a,0,t,5,t,0,2,t,0,2,m,t,f,f,1r,t,c,c,c,1,t,2,a,5,t,m,a,a,1,t,t,t,a,a,9,1,c,t,e,2,a,1,1,a,2,0,2,8,1s,0,a,9,a,a,0,1,1,1,2,1,2,1,0,a,a,2,2,a,1,c,1,a,2,2,a,10,2,2,a,0,1,1,2,1,1,2,1,2,1,a,c,2,1,2,9,0,2,a,2,a,1,1,2,5,5,6,1,1,2,b,2,a,2,1,0,2,a,1,2,8,2,f,0,2,2,i,19,5,n,1,6,d,g,g,1,1,1,2,f,6,a,2,2,2,0,2,a,m,1,0,1,2,1,2,2,2,1,a,1,a,1,2,2,1,2,2,1,a,6,0,f,f,18,0,2,2,1,a,t,5,2,2,1t,1,1,2,2,1,1,a,t,1,1,1u,1,0,1,m,1,2,2,2,1,0,1v,1,1,c,2,a,2,a,1,2,f,g,g,g,f,i,1,1,0,2,2,0,2,1,2,2,a,1,2,5,2,2,1w,1w,2,2,2,2,0,2,2,a,a,t,a,1,a,m,a,c,2,f,f,a,0,1,a,1,1,0,1,1,1,2,0,1,1,1,1x,5,5,1,2,2,a,0,2,c,1,2,0,1,2,g,2,1,2,c,a,2,1,5,2,c,2,1,a,0,a,2,a,2,a,a,a,1,1,2,2,a,a,a,f,c,a,0,a,a,a,0,a,a,a,a,2,2,1,2,1,2,1,2,a,0,a,0,f,0,a,0,f,a,2,f,g,0,1,f,f,1,2,g,a,a,f,f,9,1,a,a,a,a,a,a,g,a,6,d,a,2,a,f,1,g,2,g,c,j,f,a,g,g,g,2,5,a,a,f,2,1y,a,f,g,2,r,2,2,2,0,a,2,1,2,1,1z,1,2,2,c,f,f,0,5,2,a,a,c,1,1,a,2,0,2,2,1,2,2,2,20,2,1,2,1,n,2,1,1,2,t,t,2,2,1,1,1,2,2,1,2,f,2,2,a,c,2,f,a,2,2,1,1,2,2,1,2,a,1,2,21,2,2,2,2,a,1,2,2,a,1,1,1,2,1,2,a,2,1,b,1,2,1,1,2,m,2,2,2,2,2,a,8,a,a,2,a,a,a,2,5,2,2,1,a,2,a,2,2,0,2,5,2,2,h,2,2,2,1,1,0,22,1x,p,a,g,2,1,a,0,m,1,2,0,2,1,2,2,2,2,2,1,1,2,2,2,1,a,2,t,2,1,1,1,1,1,2,2,0,1,c,1,a,2,2,1,1,2,1,1,1,1,1,1,1,1,1,2,5,1l,2,2,1,1,b,5,1,0,2,2,1,1,2,a,1,0,2,1,2,1,2,1,2,2,1,5,1,c,2,1,c,2,2,1,2,f,1,2,1,2,2,a,1,1,1,1,1,2,2,2,2,2,5,t,c,1,2,2,1,2,1,1,a,2,1,2,1,2,7,1,1,2,2,1,2,1,1,1,1,1,1,1,1,1,2,a,1,1,1,2,23,1,1,1,1,9,t,1,2,2,2,2,2,1,1,1,2,5,1,t,2,1,t,1f,1,1,1,1,1,1,2,2,1,t,m,1,t,5,1,t,0,m,9,1l,1,1,1,1,1,2,a,1,a,2,2,a,2,a,5,0,2,2,9,g,c,24,0,2,a,25,1v,1,t,t,0,1z,2,2,2,t,5,m,26,1p,t,m,m,t,p,t,27,t,t,t,t,28,m,a,9,n,5,t,2,2,c,m,m,1v,m,a,2,2,1,2,2,0,1,1,2,2,5,2,1,a,2,2,0,2,2,2,1,1,1,0,2,1,2,1,m,1,1,1,m,t,2,1,1,2,2,2,2,1,2,2,1,2,2,2,1,a,5,1,1,2,2,1,1,a,2,1,m,9,1,1,c,6,t,5,f,1,2,2,1,2,1,2,1,a,1,2,1,1,1,2,1,1,2,2,2,2,0,2,1,1,1,1,1,1,1,1,1,m,1,2,1,1,1,0,1,a,1,a,1,1,a,2,1,2,2,2,9,1,1,1,a,2,2,2,1,1,1,m,1a,1,1,1,2,1,1,g,g,f,8,1,8,f,a,2,1,1,a,2,1,2,1,0,1,1,2,1,1,a,2,0,2,2,1,1,t,1,1,1,2,2,2,1,2,1,2,1,0,1,1,1,a,1,2,2,2,1,0,a,a,1,2,1,1,2,2,0,2,0,a,a,1y,u,a,1,2,29,2a,9,g,1,a,2,1,2,2,1,2,2,1,1,t,2,1,1,2,2,2,1,a,m,a,a,1,2,1,a,a,0,1,2,2,1,1,1,2,1,1,2,2,1,c,1,1,1,a,g,a,0,1,1,1,2,0,1,2,2,1,1,1,1,1,5,a,6,a,2,2,2,1,2,1,2,2,1,2,1,2,2,2,2,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,0,1,a,1,a,a,1,1,1,1,1,2,1,1,2,1,8,a,1,1,1,1,c,j,a,2,2,2,c,1,2,1,1,2,1,1,1,2,2,2,2,2,1,1,2,1,2,1,1,1,1,1,1,2,2,1,1,0,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,m,a,a,2,6,2,1,1,a,1,1,2,2,2,2b,2,2,1,1,1,a,5,1s,2,1,1,1,9,1,1,1,2,2,2,1,1,1,1,2c,1,1,1,2,1,2,a,2,c,1,2,1,a,1,1,2,2,2,1,1,2,2,2,1,0,1,c,t,1,1,8,1,m,a,2,1,1,f,1,8,1,1,1,2,a,a,a,1,0,1,1,1,1,1,1,2,2,2,2,0,2,2,2,2,2,2,0,2,0,2,1,1,1,2,2,1,5,t,u,g,g,g,g,0,2,2d,g,6,2e,23,a,0,2,1,t,g,1,2,1,0,a,a,a,2,2,9,2,5,2,2,1,2,1,1,1,1,1,1,2,2f,2,0,2,2,2,2,1,2,g,1,1,1,a,1,2,1,1,1,1,1,2,2,2,2,2,b,1,2,2,2,1,1,1,1,g,2,2,a,1,2,1,1,1,1,2,2,2,1,1,2,2,2,1,1,1,2,2,1,2,2,2,2,2,1,0,2,1,2,2,2,a,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1,a,a,a,a,2,2,2,1f,2,2,1,1,1,2,2,2,1,c,2,2,2,2,2,2,0,2,1,2,5,a,a,a,1,f,5,f,a,a,1,2,2,c,2,2,2,1,1,1,2g,2,2,2,1,1,2,1,1,2,1,1,1,1f,2,1f,1,1,2,2,2,1,2,2,2,1,c,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1,1,1,2,2,2,a,m,2,1,2,2,2,1,1,2,2,2,2,0,2,1,2,1,2,1,1,2,2,1,1,2,1,g,a,e,1,2,8,2h,g,m,2,b,1,2,5,2,2,1,1,1,2,g,1,2,2,a,2i,2,1,1,1,2,1,a,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2,2,2,2,2,2,2,2,2,8,a,a,a,6,1y,1y,15,1,1,1,9,9,1,1,1,1,1,a,t,1,2,1y,2,2,1,2,a,2j,1,1,1,5,2,1,1,2,1,1,t,2,1,2,1,2,2,2,2,1,2,1,1,a,1,a,1,f,1,2,2,1,2,2,1,2,t,1,18,1,m,a,1,1,1,1,1,1,1,1,2,2,2,2,1,2k,m,1,1,1,5,1,1,2,m,1,2,1,0,1,1,2,2,8,0,9,1,1,1,1,2,g,2,2,2,2,1,2,2,2,2,2,2,2,2,1,a,0,2,5,5,2l,1,1,5,a,5,1,1,1,5,f,5,1,2,2,a,1,f,g,1,1,1,5,1l,1,1,1,1,1,f,1v,m,1,1,1,0,2,2,2,2,1,2,2,1,t,2,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,18,1,1,1,1,2,1,2,1,1,2,2,2,1,6,1,5,1,a,1,a,a,a,a,8,g,g,0,1,2,1,n,0,9,9,1,1,5,1,1,1,1,0,0,a,0,5,5,t,a,5,9,2,2,1,2,0,1,1,1,1,1,2,2,2,2,1,2,2,2,1,9,1,2,1,1,1,1,1,1,1,1,1,t,1,1,1,1,1,1,m,2,1,2,2,2,c,c,1,1,1,c,2,0,a,9,1,1,1,1,1,2,1,a,1,1,1,1,1,1,2m,1,a,t,1,1,1,1,1,1,1,c,2,2,t,5,t,m,a,a,2,a,1,1,1,1,1,a,a,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1f,1,2,1,2,1,1,1,1,1,2,2,2,0,2,2,2,2,2,2,1,c,1,1,1,1,a,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,c,1,1,1,1,1,1,1l,1,1,0,1,2,2,1,1,1,e,1,1,1,1,2,1,1,2,2,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,2,1,2,1,2,21,1,1,1,1,5,1,1,5,5,1,2,2,1,1,2,2,c,1,1,1,1,1,1,1,1,1,1,1,u,1,2,1,2,m,a,1,2,1,1,1,1,1,1,1,1,1,1,1,0,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,2,9,2,2,2,a,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,t,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,c,1,1,1,1,1,9,2,2,1,1,2,1,1,a,1,1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,a,2,2,2,2,1,1,1,1,2,1,1,1,1,1,2,2,1,t,2,2,2,g,a,2,2,m,2,1,2,9,1,2,2n,2,2,2,2,2,2,2,2,0,a,a,a,1,a,5,a,1y,1,1,1,a,1,2,a,a,9,a,1,1,1,1,1,1,1,5,5,5,1,1,1,1,1,1,1,2,2,1,2,1,1,2,2,5,t,2,1,1,a,2,c,1,1,1,1,1,1,2,1,1,1,2,0,2,1,9,2,2,2,2,2,m,2,2,2,2,a,2,1,2,2,1,1,1,1,2,2,0,2,2,2,2,2,2,2,2,1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,c,2,2,2,2,2,2,2,2,2,2,c,2,2,2,1,1,a,1,1,1,a,2,2,2,2,2,u,2,2,2,2,2,2,2,2,2,18,2,2,2,2,1,18,2,2,2,2,1,1,2,1,2,2,2,2,1,1,1,2,2,2,2,2,2,a,1,1i,1i,1i,1i,2,1,1,a,1,1,m,18,2,t,2,2,m,m,2,2,2,2,18,2,2,2,2,2,2,2,2,2,2,m,2,2,2,2,2,2,2,2,2,18,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,m,t,t,a,5,1,2,1,1,1,a,1,2,1,2,1,2,2,1,2,2,2,1,a,c,2,2,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,0,2,1,2,1,2,1,1,1,1,1,2,2,1,2,2,2,2,2,1,2,2,1,1,1,2,2,2,2,1,1,2,2,2,2,2,1,2,1,1,2,1,1,2,1,2,2,2,2,2,2,2,2,2,1,2,2,1,2,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,2,2,1,2,1,9,5,1,1,1,1,1,1,2,1,2,2,2,2,2,2,1,1,2,1,1,1f,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,1,1,2,1,2,2,1,1,2,1,2,2,2,2,1,1,2,2,2,a,a,1,2,2,1,9,1,1,2,2,2,1,2,9,1,a,1,1,1,1,1,1,1,2,1,1,2,2,1,a,2,2,1,1,1,1,1,1,1,1,2,1,1,2,2,2,1,1,1,2,1,2,a,1,1,1,1,1,1,1z,a,1,1,1,1,1,2,1,2,1,1,5,1,1,5,2,1,1,1,1,1,1,1,2,5,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,2,1,1,1,2,1,1,2,2,2,2,2,1,1,2,2,1,2,2,1,1,1,2,2,1,1,1,1,2,2,1,2,2,1,1,1,2,2,2,1,2,1,2,1,1,2,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,2o,1,2,m,b,a,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1f,1f,2,1,1,1,2,2,2,2,2,2,1,2,1,2,1,2,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,0,1,2,2,1,2,1,1,1,2,2,1,a,a,1,9,9,2,1,2,f,1,1,1,1,1,1,1,1,2,1,1,a,a,c,1,1,2,a,1,1,1,1,1,1,9,1,1,1,1,2,1,1,2,9,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,2p,1,1,1,1,1,1,1,1,1,1,1,2p,1,1,1,2,1,2,1,1,1,1,g,1,1,1,1,1,1,1,1,1,1,1,2,2,0,2,1,1,2,a,1,1,1,a,2,a,a,1,2,1,a,1f,1f,1f,1,1,1,1,1f,1,2,1,1,1f,1,1,1,a,a,a,1,1,1,1,1,1,1,1,a,9,1,1,2,2,w,1,1,2q,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,0,2r,2,1,1,1,1,1,2,1,2,2,1,t,1,1,1,2,2,1,1,1,1,a,2,1,1,1,1,1,1,1,20,2s,2t,a,2,2,m,1,1,1,1,1,1,1,1,1,1,1,1,1,2,a,2,1,2,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,g,g,a,1,a,1,1,2,9,t,a,a,1,9,1,a,1,1,1,2,1,1,1,a,1,a,5,t,9,2,a,t,d,2u,m,5,t,g,f,1,9,t,1,m,a,a,2,9,2,a,1,1f,m,a,1f,1,a,a,1,9,2,a,1,a,1,2,1,1,1,2,t,u,1,1,1,1,1,5,5,5,1,1,5,5,5,1,1,1,a,a,m,m,a,2q,a,a,2v,2w,2,5,t,1,t,1,a,1,1,9,2,1,1,1,0,1,2,2,1,2,1,1,2,a,a,1,1,t,1,f,2,1,1y,2,1,a,1,1,2,23,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,a,2x,2,1,1,1,9,1,g,1,1,1,a,a,a,1,1,9,2,2,g,g,a,a,f,g,1,5,2,f,a,1,2q,a,1,9,1,2,g,0,g,a,f,g,g,a,a,1,1,5,1,1,1,1,1,9,1,a,a,g,g,z,1,1,1,g,g,g,1,d,g,d,5,2,1,a,1,1,5,a,2,0,a,2,2,1l,v,2,a,1,1,f,9,2,a,1,2,1,1,1,1,1,1,1,1,0,2,2,2,m,2,2,2,2,2,2,2,2,2,1,2y,2,1,2,2,2,2,2,2z,t,t,f,t,t,t,t,2,2,2,2,2,2,2,1,2,a,a,30,30,a,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,a,1,a,5,2,1,1,1,1,9,1,9,1,2,2,1i,1,a,2,2,2,2,2,2,2,9,1,21,1,a,1,2r,21,2,1,1,2,1,2,1,2,2,2,2,2,2,b,1,1,1,1,2,2,2,2,2,5,1,2,2,2,2,2,2,2,2,2,g,2,2,2,9,1,1,1,g,g,g,2,2,2,2,a,a,a,a,6,a,31,31,21,g,g,g,0,a,1,f,9,9,9,a,a,0,0,1w,9,9,32,32,f,9,9,9,9,9,9,9,9,9,9,9,9,2,9,9,a,8,33,4,5,6,a,1,m,2,2,1,1,9,2,2,f,m,1,9,9,9,9,9,2,9,9,9,9,9,9,9,9,9,9,9,34,34,9,9,1,1,1,1,2,9,9,9,9,9,9,9,1,1f,1,9,9,9,9,9,9,9,9,9,9,9,9,a,a,9,9,9,9,9,9,9,9,9,9,a,a,a,a,35,15,9,9,9,9,9,9,9,15,1a,1,1a,9,9,9,9,2,1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2,a,1,2,g,1,1,1,2q,2q,21,21,21,21,21,0,2,1,1,m,2,2,5,a,1,g,g,d,a,1,1,1,1,f,f,f,f,f,f,f,m,a,a,g,a,f,a,2,2,2,2,a,f,a,g,g,a,a,1,f,1,0,2,2,g,a,1f,2,1f,2,8,2,2,g,a,2,2,a,1,1,2,2,f,5,5,5,f,1,1,0,1,1,6,6,a,g,1,a,a,1,e,f,2,x,2,i,i,c,0,s,c,0,7,0,6,6,0,c,7,d,7,8,0,1,0,0,m,8,c,1,g,p,0,6,0,d,6,i,f,6,36,g,0,1,x,c,m,c,c,c,c,c,g,7,2,a,a,a,2,1,g,7,1,g,2,2,2,c,6,1,f,x,7","o":"0,0,0,0,1,2,2,3,0,0,3,3,3,3,3,1,3,3,1,1,1,1,1,1,3,3,1,1,3,3,1,1,3,1,3,3,3,1,3,3,1,1,1,3,1,3,1,3,3,3,1,3,3,3,3,1,1,3,1,3,1,1,3,3,1,3,1,1,3,3,1,1,1,3,3,1,3,3,3,3,1,3,3,3,3,3,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,3,3,3,1,3,3,3,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,1,3,3,3,3,3,3,3,1,3,1,3,3,1,3,4,5,3,0,0,3,0,6,6,0,0,3,7,0,3,0,8,9,8,0,a,2,0,0,0,b,0,0,0,0,0,0,8,9,0,0,0,c,d,8,0,9,0,0,0,0,9,0,2,2,2,8,9,0,0,2,0,0,0,0,8,0,0,8,0,b,0,0,0,9,0,e,0,e,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,9,9,9,1,2,0,0,1,8,2,e,0,0,2,2,2,1,0,0,0,0,e,3,f,g,0,9,1,2,2,h,0,0,0,e,8,0,2,1,2,1,9,3,8,h,e,8,0,0,1,2,7,2,i,0,j,e,2,k,9,8,7,0,0,8,0,a,2,2,1,l,2,0,8,0,0,1,0,0,0,e,2,3,e,h,2,1,3,3,2,8,8,6,2,b,2,1,9,0,0,1,0,2,2,m,0,3,e,0,2,1,0,3,n,0,8,3,3,0,0,o,0,3,0,7,1,2,3,3,1,0,0,8,8,a,0,8,0,0,0,6,1,p,p,p,a,0,0,0,1,0,0,3,3,0,0,3,e,a,0,3,1,3,2,a,a,1,2,1,e,3,p,8,1,3,i,0,0,0,1,1,3,0,0,1,e,8,a,0,0,a,6,h,h,e,q,0,3,a,e,0,1,1,9,8,1,3,0,1,0,0,1,0,0,1,0,2,0,1,0,1,0,0,r,e,0,e,0,0,s,0,0,0,3,e,8,9,0,1,0,8,0,e,0,0,0,e,p,0,0,8,0,7,0,0,0,2,2,3,9,0,0,0,0,0,0,6,9,0,3,8,0,0,6,0,9,0,0,0,8,8,0,0,3,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,2,2,0,0,2,0,2,0,6,0,0,1,2,8,0,1,8,1,8,9,1,0,8,3,3,0,9,0,0,8,0,8,0,9,h,0,0,3,0,6,0,0,0,8,e,1,9,2,0,0,0,0,0,0,e,t,3,0,e,3,8,0,e,h,2,0,0,0,0,0,0,0,0,0,e,0,8,7,t,0,8,e,1,0,0,0,3,3,3,8,0,0,3,u,3,0,0,2,0,3,3,3,0,9,9,1,7,1,b,0,0,8,2,0,a,0,0,0,0,e,e,0,0,3,3,0,0,7,0,0,6,6,0,0,9,8,0,2,l,m,0,0,1,0,1,9,0,9,6,2,0,0,2,2,0,2,0,0,0,0,0,2,2,3,2,2,0,l,1,1,1,1,3,0,6,1,3,0,1,0,0,0,0,0,3,e,0,0,e,0,0,0,8,l,0,0,7,0,1,8,8,0,0,2,0,2,3,3,0,8,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,i,e,7,0,2,0,0,2,0,2,a,0,0,2,0,1,1,0,0,2,0,0,2,a,3,0,0,0,0,3,3,0,2,3,0,0,0,0,0,e,8,8,0,0,3,0,7,0,0,2,0,0,0,0,0,0,3,0,0,0,0,0,e,2,1,2,0,0,0,0,0,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,b,b,6,0,b,0,0,0,0,6,b,b,0,3,2,0,0,b,3,3,3,0,1,b,i,0,1,0,7,p,0,a,e,6,0,0,e,e,e,0,0,8,0,0,3,3,3,0,0,2,0,3,0,1,9,2,0,9,6,6,e,0,1,3,0,0,0,3,3,3,3,e,t,e,0,0,3,0,0,5,5,3,7,e,3,0,p,8,2,0,1,3,v,0,0,3,1,7,0,3,0,p,1,0,0,3,0,7,0,7,0,3,1,b,3,3,0,2,6,6,0,0,0,0,w,7,1,2,0,0,0,e,0,2,0,9,0,0,2,0,0,x,g,0,2,0,2,1,0,1,b,3,0,0,2,a,0,0,g,9,0,0,8,8,3,0,0,8,9,9,0,0,0,y,0,e,0,8,i,i,0,0,e,e,i,p,t,1,6,0,0,0,0,0,t,0,8,0,7,0,0,0,1,1,1,0,3,3,6,0,3,3,3,7,0,3,0,6,6,0,2,g,x,0,1,2,0,1,0,1,0,3,0,6,2,0,0,0,0,0,0,3,6,6,3,0,p,1,0,0,0,1,0,z,0,e,0,0,6,i,e,1,1,0,0,3,3,1,10,0,e,0,0,g,l,0,0,0,b,0,0,0,0,0,3,1,1,0,0,g,1,7,t,t,3,3,1,0,0,0,e,8,0,0,0,h,8,0,0,9,0,0,1,e,3,e,3,0,0,e,e,2,3,7,9,3,0,1,p,e,0,0,0,0,0,0,0,l,2,2,0,e,e,0,g,1,0,0,9,6,0,2,e,t,6,0,0,6,6,3,1,6,6,0,1,0,0,0,0,0,0,b,0,0,6,0,0,0,3,3,0,0,0,z,1,0,1,6,7,0,7,0,0,3,0,6,0,0,0,0,1,0,0,1,e,2,f,0,3,0,6,1,1,l,0,0,3,9,0,0,0,0,0,w,0,2,0,0,0,0,2,0,0,l,0,0,0,0,0,3,6,a,0,0,6,2,1,0,0,a,9,3,3,a,1,6,e,2,0,6,0,0,0,0,3,8,0,2,1,0,2,6,t,t,a,0,0,2,0,0,2,2,0,0,a,0,3,0,8,2,0,0,0,6,0,6,3,0,11,6,0,2,0,12,0,1,0,0,0,0,0,1,0,0,1,0,0,13,0,0,1,0,0,6,0,0,0,0,0,3,0,3,6,0,0,0,0,0,6,0,0,0,0,0,1,l,0,3,1,0,1,0,0,3,3,1,0,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,9,2,0,0,0,0,0,6,0,6,6,l,6,l,6,l,6,0,0,9,l,l,l,6,0,l,l,l,0,0,l,l,0,0,0,1,0,0,0,0,0,0,0,0,2,0,0,0,0,l,0,0,l,l,0,h,3,0,6,l,6,0,6,14,0,15,6,0,0,0,1,6,6,0,l,0,1,0,1,0,0,1,16,6,0,1,0,0,0,0,6,17,0,3,3,0,0,11,0,0,6,6,0,1,7,e,0,7,17,0,0,3,b,a,0,0,2,0,3,3,g,0,a,6,l,6,3,0,0,0,8,2,0,0,0,0,0,0,0,0,6,0,3,3,0,6,6,9,g,g,i,0,6,0,0,0,0,0,6,6,0,18,0,6,6,6,19,0,1a,0,0,0,0,3,0,0,0,2,g,0,7,17,17,6,1,0,6,2,e,6,3,3,6,0,0,0,0,0,0,0,0,0,p,1,1,1,0,0,0,1,0,0,0,3,0,0,0,2,1b,0,0,13,7,1c,1,3,0,3,6,0,0,1,3,0,1,0,g,3,0,0,0,0,1,0,2,0,3,3,3,0,2,a,0,1,3,7,0,0,3,0,e,0,0,0,p,1,6,6,a,0,0,e,g,0,0,1d,6,0,0,1,0,0,1e,0,e,e,3,1f,0,3,0,0,e,2,1,0,2,0,0,0,0,0,0,0,1,0,0,1,3,0,0,a,0,7,h,e,e,0,0,3,0,0,0,3,0,3,6,0,0,1,0,6,0,0,0,3,i,0,0,0,3,0,e,e,3,3,0,8,0,8,0,0,2,0,2,0,0,0,0,b,1,0,0,0,2,0,0,0,0,0,0,0,0,0,1g,0,0,0,0,e,0,t,e,0,0,8,3,9,9,3,h,6,1,0,e,13,0,0,0,0,0,0,e,0,0,0,1h,0,e,0,g,3,0,0,0,0,e,e,1,0,2,1i,0,0,e,2,0,2,2,3,e,0,0,0,0,0,9,0,0,3,e,1,0,b,0,1,e,e,0,b,0,b,b,1j,1j,b,b,5,b,1,1,3,1k,1k,13,1k,0,b,b,0,3,1,0,9,0,e,0,1l,0,0,e,0,0,0,0,6,1,0,0,0,0,0,1,6,6,e,1h,0,0,0,1,3,3,3,0,0,0,2,1m,0,1,0,0,0,1,0,0,0,p,0,6,0,0,1k,0,7,1n,0,p,6,1k,0,0,p,7,0,7,0,0,0,5,0,0,1o,0,p,0,0,1,0,1,0,1,0,0,p,0,0,p,e,e,e,0,3,0,0,e,0,e,e,0,0,0,0,0,0,0,a,0,0,e,0,e,0,0,0,0,0,0,0,0,1,0,0,0,0,9,2,6,0,0,0,0,0,0,0,0,h,0,6,h,1,0,0,0,1,0,2,3,e,3,1,0,1,3,0,3,0,0,3,0,0,e,13,7,1,0,0,0,e,0,0,0,1,1,g,0,0,0,0,0,0,0,0,2,0,0,1,7,6,13,0,13,6,13,13,0,1,0,1,0,m,3,0,0,3,g,2,3,3,0,0,e,1p,0,0,t,g,1,e,1,1,0,2,3,3,0,0,0,0,g,1q,2,2,1,e,e,3,2,1r,0,g,0,2,3,2,2,2,2,2,0,0,e,t,0,0,0,0,3,0,2,0,0,1s,2,2,1,0,2,0,3,2,1,8,0,3,1,0,0,7,g,8,3,e,9,e,1,11,11,0,0,0,0,0,0,2,6,6,6,6,0,6,0,1,2,1t,0,1,1,0,0,0,0,0,e,0,6,0,0,0,0,0,3,0,0,0,e,0,2,1,1,1,1,0,0,1,6,6,6,0,0,0,3,0,6,7,6,3,3,0,0,0,2,0,0,2,g,3,0,t,0,0,0,g,0,1,0,0,6,0,6,e,0,3,g,2,h,0,0,3,t,0,2,1,0,0,3,0,0,0,7,0,2,0,0,0,2,0,0,0,0,h,7,0,0,6,0,e,0,0,1,7,0,2,0,0,0,0,0,0,0,5,0,0,0,0,0,0,6,0,0,0,0,0,a,3,0,0,0,6,0,0,g,g,g,0,0,0,6,0,0,6,0,g,g,0,0,g,g,2,2,g,6,3,g,3,0,0,2,2,2,a,6,g,g,g,g,g,0,0,g,t,2,2,h,0,h,0,e,0,1,a,8,2,d,2,2,h,2,1u,1v,2,2,2,2,2,2,2,2,2,2,2,1i,2,2,2,2,2,2,2,2,2,0,2,2,2,1i,a,2,2,2,2,2,2,2,2,1u,2,0,1,0,0,2,0,2,e,0,0,0,6,2,g,2,0,6,0,e,6,0,g,0,3,3,1,0,0,g,2,0,g,g,0,6,2,3,0,1,6,0,3,h,6,e,0,6,0,2,0,0,6,0,0,t,1,0,0,0,0,0,0,a,0,g,1,u,6,0,0,7,b,0,0,0,7,3,0,0,0,0,0,0,0,0,0,g,0,0,6,0,0,g,g,g,g,g,g,g,g,g,g,1,2,0,0,0,0,0,0,1w,0,0,g,g,h,0,2,3,0,0,a,g,g,t,1g,3,0,1,0,0,0,3,a,0,0,0,1,1,0,2,2,0,8,0,0,0,0,0,0,0,2,3,g,3,0,5,0,0,1,g,0,e,6,0,0,0,0,0,3,e,2,2,0,2,2,1,6,0,0,7,0,0,0,0,0,0,0,3,3,2,2,2,2,0,0,t,0,0,2,0,2,3,0,2,0,9,2,0,0,a,2,a,0,g,h,1,0,1,1,0,3,2,0,0,1,0,0,t,3,0,1,3,0,0,0,3,2,0,0,3,3,0,0,3,1,3,1,2,1,0,0,0,0,e,e,0,e,e,0,q,h,0,e,3,2,2,7,0,3,7,0,0,0,0,0,0,0,d,0,3,1,0,0,8,0,3,1,0,0,0,0,2,7,3,g,0,1x,1,2,0,0,0,0,0,0,0,0,0,0,p,7,p,0,0,0,0,0,0,g,0,2,g,0,1,0,0,0,0,2,0,0,e,e,0,3,3,3,1,0,1,t,0,0,0,0,0,0,7,0,0,1,0,0,7,0,7,7,0,0,0,0,1,3,3,0,0,0,t,0,0,0,0,0,0,0,0,0,0,0,3,0,0,e,3,h,0,6,0,0,0,0,19,0,0,0,0,0,0,t,6,0,1y,0,e,0,3,0,1,1,11,a,g,1,3,3,0,0,g,0,0,0,0,0,2,0,0,3,1,0,2,2,g,6,0,e,0,3,6,0,2,g,0,0,0,0,3,0,0,0,3,3,3,p,0,3,0,3,0,0,0,0,p,3,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,7,7,7,7,7,p,7,p,p,p,7,e,1,3,6,1,6,0,0,9,q,0,8,0,0,1,0,8,0,0,0,0,2,1,3,3,8,0,7,0,0,0,t,1,0,0,a,0,l,0,0,0,0,0,0,0,0,0,2,1,1z,0,0,3,1,3,7,g,0,9,0,g,0,t,3,0,0,1,3,1,0,0,6,0,2,e,0,0,6,6,1,1,3,1,0,8,0,1,0,0,3,0,0,0,0,0,0,0,0,0,1,0,3,0,3,1,1,1,1,1,3,3,3,3,3,0,1,0,1,1,0,0,7,20,0,7,0,1,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1,1,0,2,0,2,0,2,0,2,0,0,0,0,2,2,0,0,0,0,3,0,0,8,0,0,0,0,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,0,0,0,0,0,0,0,3,2,0,0,0,0,0,0,0,e,h,0,0,0,0,e,h,0,0,0,0,0,0,0,e,0,0,e,0,2,1,0,0,1,3,1,0,1,0,0,2,0,0,0,0,0,0,0,0,g,0,0,0,0,0,7,i,0,0,0,0,e,0,0,3,3,0,0,0,0,0,0,3,g,g,0,0,0,0,0,0,0,3,0,0,g,6,e,0,0,0,0,0,1,1,0,1,1,3,1,1,1,1,3,3,1,1,3,1,0,3,1,1,1,1,1,3,3,1,3,1,3,1,3,1,0,3,1,3,1,1,3,3,1,3,1,3,1,1,p,0,0,0,0,0,0,a,g,0,g,a,a,e,g,g,0,0,0,3,0,1,0,0,0,0,0,3,21,g,g,g,3,0,0,g,g,6,0,3,0,0,0,2,0,1,e,h,a,h,3,3,0,g,h,0,e,0,0,3,0,6,6,g,3,3,3,2,g,0,0,g,g,g,g,g,g,g,0,1,1,1,1,0,3,2,13,0,0,22,23,1,1,2,1,6,0,1,0,g,3,6,p,2,a,0,2,1,0,6,8,3,3,3,3,0,3,3,3,3,3,3,3,3,0,6,13,0,0,0,24,3,3,13,e,0,0,0,g,6,1o,0,6,0,6,6,0,0,0,0,0,0,6,6,g,g,g,g,0,8,2,2,3,2,2,2,2,1f,5,25,2,25,26,2,3,b,2,1,0,0,g,g,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,g,3,g,0,3,g,3,0,0,g,0,0,0,g,6,0,0,0,0,0,p,7,p,27,g,1,0,6,0,a,a,0,0,0,0,0,0,3,0,0,2,0,0,3,3,3,3,a,3,3,0,3,3,0,0,0,0,0,0,0,0,0,0,6,6,3,0,a,0,0,0,0,0,0,0,0,0,0,0,6,0,0,1,1,0,0,1,1,1,1,1,3,3,0,0,3,0,1,0,3,2,a,0,2,1,1,3,p,0,e,1,3,3,1,1,0,7,0,0,3,g,3,3,3,3,3,3,0,1,1,3,3,3,0,1,e,3,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,p,0,0,e,e,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,6,0,0,0,0,7,7,0,0,0,0,0,0,0,0,7,0,0,7,p,0,0,0,0,0,0,0,b,0,0,0,0,0,0,0,0,7,e,28,2,e,0,e,e,0,0,0,0,0,0,2,0,0,2,3,3,0,0,0,6,6,0,0,0,0,0,0,0,0,0,0,0,9,2,0,0,3,0,3,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,2,2,0,0,0,0,0,0,a,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,g,1,0,0,0,0,0,0,0,g,0,0,0,0,0,6,0,0,0,0,0,0,0,0,g,3,0,0,0,0,0,0,3,2,0,0,2,0,a,0,1,0,0,0,3,0,1,1,0,1,1,1,0,1,0,0,1,1,1,1,1,0,0,3,1,1,0,3,3,1,0,2,0,0,0,3,6,3,0,0,0,0,0,0,0,0,0,0,3,0,1,3,1,1,3,8,0,1,3,3,20,0,3,0,0,3,t,6,t,t,t,t,t,t,t,h,0,h,0,0,0,0,0,0,0,6,0,0,0,7,1,h,a,e,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,29,g,2a,0,0,3,2,0,6,0,0,0,0,2,3,0,0,0,0,0,1,3,0,3,0,0,6,3,3,a,1,0,3,1,1,3,e,e,e,0,0,3,3,1,2,0,0,0,0,e,0,0,0,0,2,0,6,0,0,6,0,0,0,0,b,1,1,0,0,0,1,0,7,0,0,0,0,0,3,0,3,0,0,0,7,0,0,0,0,0,0,3,0,0,1,0,6,0,0,0,0,6,0,2,2,2,0,0,0,0,1,0,0,0,0,3,3,3,3,3,3,3,0,3,3,3,3,0,0,0,0,0,3,3,0,3,3,0,0,3,3,3,3,3,3,0,1,0,0,0,0,0,0,2b,8,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,1,3,3,1,0,3,3,3,0,3,1,1,0,1,1,1,1,1,1,1,3,3,1,0,1,3,1,1,0,3,0,3,0,0,3,0,0,3,0,0,0,1,1,1,0,3,3,0,0,2c,0,0,1,1,1,1,1,1,1,1,1,0,1,1,0,0,2,1,1,3,1,0,0,1,1,1,1,1,1,1,0,1,3,1,0,1,0,1,1,1,1,1,1,1,1,1,3,1,1,3,1,6,0,0,1,0,1,0,0,3,3,0,0,1,0,p,1,3,0,3,1,a,1,3,3,3,3,3,3,3,3,3,3,3,1,1,1,3,3,7,2,0,2d,0,0,3,1,3,1,1,3,1,1,1,3,3,1,3,0,3,1,1,3,3,3,3,3,1,1,3,3,3,3,3,1,3,1,1,3,3,1,1,1,1,1,1,3,3,1,3,1,3,3,3,1,1,1,0,t,0,e,2,0,a,0,3,0,2,2,0,0,a,3,0,0,0,0,0,0,0,0,7,1,0,2,1v,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,1,3,1,3,3,3,3,3,1,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,3,3,3,3,3,3,1,3,3,3,3,3,3,3,3,1,1,1,3,1,1,3,3,1,3,3,3,1,1,3,3,3,1,1,1v,1,3,3,1,3,1,3,3,3,3,3,3,1,1,3,3,3,3,3,3,3,1,3,1,3,1,1,1,3,1,3,1,3,1,3,1,3,1,1,1,3,3,3,1,1,3,3,3,3,3,1,3,3,3,3,3,3,3,3,1,3,3,1v,1,3,3,3,3,1,1,3,3,3,3,1,1,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,3,3,3,3,3,3,3,3,3,1,3,3,3,3,3,3,1,3,3,3,3,3,1,3,1,3,3,1,3,0,6,7,2,2,e,0,0,0,0,0,3,3,3,g,0,3,0,3,0,7,1c,0,0,0,2,1,1,1h,0,0,0,e,0,0,0,0,0,g,7,g,g,g,g,0,2,2,0,0,0,0,0,0,g,g,g,g,g,g,g,g,g,g,g,1,6,0,0,g,t,0,0,0,0,g,0,g,0,g,7,7,0,0,0,g,a,a,7,g,0,0,0,g,2,2,2,2,2,2,2,2,0,0,0,0,2,0,0,t,0,g,0,g,0,0,a,0,g,0,g,0,g,g,7,a,0,g,g,g,g,2,g,0,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,7,0,7,g,g,g,g,0,g,g,g,6,g,g,g,g,g,g,g,7,6,6,6,g,g,e,0,0,0,h,0,e,e,e,2,0,g,h,e,e,e,h,g,h,h,e,h,e,h,h,e,0,h,h,h,h,0,g,g,g,g,g,g,g,g,3,a,2,0,0,0,a,g,g,0,g,g,g,6,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,1e,e,0,0,7,0,g,g,g,7,g,2,2,g,2,1,0,g,g,0,3,0,0,0,3,1,0,2,0,0,0,0,0,0,0,0,e,b,b,2e,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,1,3,1,3,1,0,3,9,0,g,0,0,0,0,0,0,8,9,8,g,0,0,0,2,a,6,0,8,0,a,0,0,0,0,0,0,0,0,0,0,0,0,0,6,a,7,0,2,0,2f,2,0,6,8,8,a,a,2,0,2,p,0,2,a,2,2,2,2,2,2g,2,2,0,0,2,a,2,2,2,8,2,2,2,2,2,2,2,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,9,9,0,0,2h,2h,0,2,6,7,6,g,0,2i,2j,a,2,g,e,g,0,g,7,7,g,p,g,g,7,0,0,g,g,6,g,p,2,g,0,7,g,0,0,g,0,2k,0,e,0,0,0,0,6,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,7,0,0,0,0,z,7,0,0,a,1,7,g,g,1g,i,0,0,0,g,a,6,7,2l,0,t,0,3,0,0,5,0,7,7,2m,0,0,0,a,0,2,0,p,p,0,p,p,e,0,e,0,0,0,0,0,0,0,0,a,7,0,0,2n,2n,2n,0,0,6,0,0,9,0,0,0,9,2,e,0,0,e,6,9,2o,0,2p,4,6,6,6,8,0,1,1g,1g,p,a,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,b,b,0,0,6,6,6,6,6,6,6,e,6,6,6,6,6,6,6,6,6,6,6,3,7,0,0,0,0,0,0,9,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,e,0,0,0,0,e,0,0,0,0,a,0,a,0,0,2,2,0,0,2,2,2,2,2,0,0,a,0,0,0,0,0,0,0,0,0,1,e,0,0,0,7,7,0,0,0,0,a,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,q,0,0,0,a,0,0,0,q,q,0,e,0,e,e,0,0,0,0,8,0,0,0,0,2q,9,0,0,0,0,2r,a,a,a,0,0,1j,1j,0,a,a,0,0,0,a,a,a,a,a,a,a,a,a,a,a,a,2,a,a,0,2s,2t,0,k,9,0,2,2,0,0,2u,2v,a,0,0,0,0,a,a,a,a,a,a,0,a,a,a,a,a,a,a,a,a,a,a,0,0,a,a,1f,1f,1f,1f,0,a,a,a,a,a,a,a,z,2,0,a,a,a,a,a,a,a,a,a,a,a,a,0,2,a,a,a,a,a,a,a,a,a,a,0,0,0,0,0,a,a,a,a,a,a,a,a,a,a,0,a,a,a,a,a,2,0,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,0,0,g,2,0,e,e,e,0,0,e,0,0,0,0,e,0,1,1,6,6,2,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,e,e,e,e,8,0,0,0,0,0,3,g,q,g,i,e,e,0,0,0,0,0,0,0,g,g,q,0,g,g,0,t,0,6,6,0,0,0,0,0,6,6,0,g,0,q,0,0,0,g,0,0,g,i,0,2,e,2,9,m,2,1,u,0,0,8,2,0,0,e,2w,8,0,9,0,0,0,2,0,3,e,e,e,8,3,0,9,1,9,e,9,8,8,8,0,0,0,3,3,3,0,1,0,1,1,8,8,3,8,0,0,0,0,8,8,2,q,0,0,0,3,0,0,8,u,0","vd":["132000;33000","33000","33000;11000","33000;3000","150000;33000","66000","400000;132000","400000;275000;132000","275000;132000","33000;750","132000","132000;25000","132000;33000;11000","400000;275000","275000;33000","275000","400000","400000;275000;132000;66000","400000;132000;33000","132000;33000;25000","275000;132000;25000","275000;33000;25000","132000;11000","132000;66000","275000;66000;22000;11000","132000;66000;11000","400000;275000;132000;22000","132000;25000;11000","400000;275000;132000;33000","66000;11000","400000;25000","275000;66000","33000;25000","275000;132000;33000","132000;66000;6000","400000;132000;25000","132000;33000;25000;11000","275000;132000;11000","132000;33000;11000;400","400000;275000;66000;11000","400000;275000;132000;33000;11000","33000;11000;750","132000;66000;20000;25000","450000;400000","33000;11000;400","400000;33000","33000;22000;750","275000;132000;66000","66000;33000;11000","66000;5750","275000;250000","33000;6600","33000;6600;240","275000;33000;20500","33000;110000","132000;66000;33000","275000;132000;33000;25000","66000;20000","132000;66000;20000","33000:11000","66000;20000;11000","132000;22000;11000","66000;11500","132000;66000;33000;11000","66000;11000;400","400000;275000;25000","110000;33000","132000;22000","33000;132000","600000;400000","400000;220000","66000;33000","220000;400000","33000;11000;230","110000;33000;11000","220000","400000;132000;33000;11000","132000;66000;20000;11000","132000;20000","132000;11000;6600","66000;22000;6600","132000;33000;750","66000;6600","400000;200000","33000;11000;6600","220000;34000","400000;150000","515000;400000","132000;6600","220000;132000","33000;66000","66000;132000","33000;11000;11000","400000;380000","66000;22000;11000","11000;33000","320000;132000","33000;6000","400000;320000","33000;11000;415","220000;275000","525000;400000","33000;11000;1500","275000;13800","132000;13800","275000;16000","33000;400","33000;6400","33000;27000","220000;66000","32000;132000","275000;150000","220000;33000","150000;400000","400000;132000;66000"],"od":["","National Grid Electricity Distribution","UK Power Networks","National Grid Electricity Distribution Plc","RWE","SSE","Northern Powergrid","Scottish and Southern Electricity Networks","National Grid","National Grid Electricity Transmission","Network Rail","SSE Power Distribution","National Grid; UK Power Networks","National Grid PLC","SP Energy Networks","Scottish and Southern Energy","NIE Networks","Scottish Power","SP Transmission","EDF Energy Networks Ltd.","Électricité de France","YEDL","UKPN","National Grid Electricity Distribution (South West) plc","SSEN Distribution","SSEN Transmission","NGET","United Utilities","National Grid Electricty Transmission","Electricity North West","National Grid;Western Power Distribution","Westen Power Disribution (South West) plc","Scottish and Southern Energy plc","Mutual Energy","Southern Electric Power Distribution","Scottish and Southern Electricity Networks (SSEN)","Northern Power Grid","Northen Power Grid","Northern Powergrid (Yorkshire)","NPG","SSE Scottish Hydro","Northern Power Grud","Central Networks","NEDL","Maddison Street Substation","ENW","Louth Substation","ENWL","Scottish and Southern Energy Power Distribution","Western Distriution Networks","SSE plc","UK Power Networks (SPN)","SEPD","Scottish Hyrdo Electric","London Underground Limited","RWE Renewables","Scottish & Southern Energy","National Grid Transmission","Scottish Hydro Electric","ESP Electricity","Scottish Hydro Electric Transmission Limited","Scottish Hydro","Scottish Power Distribution","Electricity Northwest","Lightsource Renewable Energy","Scotish and Southern Electric PLC","London Underground","Western Power Distribution","Scottish Power Renewables","SSE Energy  (formerly Scottish and Southern Energy plc)","United Utilites","National Grid Electricity Transmission PLC","SSE Networks","Vattenfall","NPG and Natural Power","NP","ElecLink","South Eastern Power Networks","South Eastern Power Networkds","Northern Power Grid (NPG)","Southern Electric","SP Distribution","Northen Powergrid","Western Distribution Networks","Michelin Tyre PLC","Electricty North West","Telehouse","Nexus","whitetweor energy","Statkraft","London Power Network Public Limited Company","Landmark Power","Moray East Offshore wind farm","Uniper","BayWa Renewables","National Grid plc","JRB Generation","Vatenfall","Conrad Energy","Statera Energy Limited","Humber Gateway OFTO","Westermost Rough OFTO","short=sspn","short =SSEN","Manweb"],"source":"globalgrid2050.com/grid_substations.geojson (same 5,800 features and order as grid-data.js)","attribution":"(c) OpenStreetMap contributors, ODbL"}/*DATA-END*/;

  var C = { cyan: '#00ffff', sky: '#66ccff', amber: '#ffb000', green: '#22ee77', white: '#ffffff' };
  var FONT = '"Segoe UI", Arial, sans-serif';
  var NRULE = 20000;            // grid.js N: particle i carries key floor((i + 0.5) * SPACE / NRULE)
  var NSUB = 5800;
  var DMAX = 8;                 // the one control: D = 0 stars, 1 to 2 the stars gather, 2 to 8 the fall to one substation
  var ZEND = 18;                // MapLibre zoom at the bottom of the fall
  var GA = 2.399963229728653;   // golden angle (grid.js / pilot.mjs station clusters)
  var MAPLIBRE_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.js';    // GridAtlas shell index.html:133
  var MAPLIBRE_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.css';  // GridAtlas shell index.html:8
  var DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';       // GridAtlas engine :667
  var SAT_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'; // :1353
  var GA_DATA = 'https://ventusltd.github.io/gridatlas/atlas/releases/202608300453-atlas-v9/data/';
  var GA_LINES = [['400', '#0054ff', 2.5], ['275', '#ff0000', 2.0], ['132', '#00cc00', 1.5]]; // GridAtlas ukConfig, shell :145-149
  var ATTR_MAP = 'Data © OpenStreetMap contributors | © CARTO';                       // GridAtlas shell :39
  var ATTR_SAT = 'Imagery: Esri, Maxar, Earthstar Geographics';                                 // simulator overlay.html:43
  var ATTR_SUBS = 'Substations and lines © OpenStreetMap contributors, ODbL';
  var ATLAS_URL = 'https://ventusltd.github.io/gridatlas/atlas/';
  var SIM_URL = 'https://globalgrid2050.com/energy-transition-simulator/202609282123/overlay.html';
  // grid-data.js stores each network in its own frame: x = ax lon + bx, y = ay lat + by (fitted, descent/DESCENT-MAP.md)
  var FRAME = { substations: [0.09964309, 0.31622146, 0.16536946, -9.15422211],
    grid400: [0.15191996, 0.22101387, 0.25086508, -13.53743135], grid132: [0.12832519, 0.30976879, 0.21383207, -11.62522065] };
  // tower proportions used by the PYLONS drawing: 400 kV H 50 m, base half-width 6 m, arms 10.5 / 12 / 9 m at 0.62 / 0.77 /
  // 0.92 H (typical values stated in globalgrid2050 energy-transition-simulator/202609282123/mod/pylons-real.js:19-21)
  var TOWER = { H: 50, base: 6, armZ: [0.62, 0.77, 0.92], arm: [10.5, 12, 9] };

  var S = null;
  var D0 = null;   // decoded data, kept between opens

  // ---------------- data ----------------
  function loadScript(src, cb) {
    var s = document.createElement('script'); s.src = src;
    s.onload = function () { cb(true); }; s.onerror = function () { cb(false); };
    document.head.appendChild(s); return s;
  }
  function ensureGridData(cb) {
    if (window.KGGridData) return cb();
    loadScript(SCRIPT_SRC ? SCRIPT_SRC.replace(/descent\.js(\?.*)?$/, 'grid-data.js') : 'modules/grid-data.js', function () { cb(); });
  }
  function merc(lon, lat, out, i) {
    var la = Math.max(-85.05, Math.min(85.05, lat)) * Math.PI / 180;
    out[2 * i] = (lon + 180) / 360;
    out[2 * i + 1] = (1 - Math.log(Math.tan(Math.PI / 4 + la / 2)) / Math.PI) / 2;
  }
  function unmercLat(y) { return Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI; }
  function decode() {
    if (D0) return D0;
    var G = window.KGGridData, n = SUB.n, i;
    function arr(s) { var a = s.split(','), o = new Int32Array(a.length); for (var k = 0; k < a.length; k++) o[k] = parseInt(a[k], 36); return o; }
    var dl = arr(SUB.lon), da = arr(SUB.lat), lon = new Float64Array(n), lat = new Float64Array(n), m = new Float64Array(2 * n);
    var L = 0, A = 0;
    for (i = 0; i < n; i++) { L += dl[i]; A += da[i]; lon[i] = L / 1e5; lat[i] = A / 1e5; merc(lon[i], lat[i], m, i); }
    var names = new Array(n), low = new Array(n), nm = (G && G.substations && G.substations.names) || {};
    for (i = 0; i < n; i++) { names[i] = nm[i] || ''; low[i] = names[i].toLowerCase(); }
    D0 = { n: n, lon: lon, lat: lat, m: m, v: arr(SUB.v), o: arr(SUB.o), names: names, low: low, lines: null };
    // UK frame: bounding box of every substation in Web Mercator
    var x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (i = 0; i < n; i++) { var x = m[2 * i], y = m[2 * i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    D0.box = [x0, y0, x1, y1];
    return D0;
  }
  // GRID: the 400 kV and 132 kV networks of grid-data.js as Web Mercator segments
  function decodeLines() {
    var G = window.KGGridData; if (D0.lines || !G) return D0.lines;
    var out = {};
    ['grid400', 'grid132'].forEach(function (k) {
      var net = G[k]; if (!net) return;
      var f = FRAME[k], n = net.n, xy = net.xy, mm = new Float64Array(2 * n), i;
      for (i = 0; i < n; i++) merc((xy[2 * i] / 1e4 - f[1]) / f[0], (xy[2 * i + 1] / 1e4 - f[3]) / f[2], mm, i);
      var e = net.e, me = e.length / 2, seg = new Int32Array(2 * me), a = 0;
      for (i = 0; i < me; i++) { a += e[2 * i]; seg[2 * i] = a; seg[2 * i + 1] = a + e[2 * i + 1]; }
      out[k] = { m: mm, seg: seg, ns: me };
    });
    D0.lines = out; return out;
  }
  function voltText(i) {
    var v = SUB.vd[D0.v[i]] || ''; if (!v) return 'VOLTAGE NOT IN THE PUBLIC FILE';
    var parts = v.split(';'), o = [], k;
    for (k = 0; k < parts.length && k < 6; k++) { var x = parseFloat(parts[k]); o.push(isFinite(x) && x >= 1000 ? (x / 1000) + ' kV' : parts[k]); }
    return o.join(' / ');
  }
  function opText(i) { return SUB.od[D0.o[i]] || 'OPERATOR NOT IN THE PUBLIC FILE'; }
  function nameOf(i) { return D0.names[i] || 'SUBSTATION ' + i + ' (NO NAME IN THE PUBLIC FILE)'; }
  function keyOfSub(i) { return S.subKey[i]; }   // grid.js keyOf(i): the key of the star with index i, the one that lands here
  function bearingOf(p) { var b = (90 - p.deg) % 360; return b < 0 ? b + 360 : b; }
  function fmt(x) { return Math.round(x).toLocaleString('en-GB'); }
  function km(i, j) {   // great-circle distance, haversine, mean Earth radius 6371.0088 km
    var r = Math.PI / 180, p1 = D0.lat[i] * r, p2 = D0.lat[j] * r, dp = p2 - p1, dl = (D0.lon[j] - D0.lon[i]) * r;
    var a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  // ---------------- sound ----------------
  function audio() {
    if (!S || S.muted) return null;
    if (!S.ac) {
      try {
        S.ac = new (window.AudioContext || window.webkitAudioContext)();
        S.osc = S.ac.createOscillator(); S.og = S.ac.createGain(); S.osc.type = 'sine'; S.og.gain.value = 0;
        S.osc.connect(S.og); S.og.connect(S.ac.destination); S.osc.start();
      } catch (e) { S.ac = null; return null; }
    }
    if (S.ac.state === 'suspended') S.ac.resume();
    return S.ac;
  }
  function ping(semi, gain) {
    var ac = audio(); if (!ac) return;
    var t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = 440 * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain || 0.04, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.55);
  }
  function fallTone(speed) {   // a soft tone that falls in pitch as you descend
    if (!S.ac || !S.og) return;
    var t = S.ac.currentTime, g = S.muted ? 0 : Math.min(0.03, speed * 0.02);
    S.og.gain.setTargetAtTime(g, t, 0.08);
    S.osc.frequency.setTargetAtTime(520 * Math.pow(2, -S.D / 3.2), t, 0.08);
  }

  // ---------------- helpers ----------------
  function el(tag, css, text, parent) {
    var d = document.createElement(tag); if (css) d.style.cssText = css; if (text != null) d.textContent = text;
    if (parent) parent.appendChild(d); return d;
  }
  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function ease(v) { return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; }
  function on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt || false); S.listeners.push([t, ev, fn, opt || false]); }

  // ---------------- layout ----------------
  function layout() {
    var host = S.host, W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight;
    W = Math.max(200, W); H = Math.max(200, H);
    var phone = Math.min(W, H) < 600, dpr = Math.max(1, window.devicePixelRatio || 1);
    var sc = Math.min(dpr, 2); if (phone) sc = Math.min(sc, 2048 / W, 2048 / H);   // LIMITS-DESIGN.md canvas caps
    S.W = W; S.H = H; S.phone = phone; S.sc = sc; S.port = phone && H > W; S.land = phone && W >= H;
    S.cv.width = Math.round(W * sc); S.cv.height = Math.round(H * sc);
    S.cv.style.width = W + 'px'; S.cv.style.height = H + 'px';
    S.cx = W / 2; S.cy = H / 2;
    S.Rpx = Math.min(W, H) / 2 * (phone ? 0.94 : 0.88);
    S.Rw = Math.sqrt(S.SPACE + 0.5);
    var b = D0.box, R2 = S.Rpx * 2 * 0.86;
    S.Cuk = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    S.wsUK = Math.min(R2 / (b[2] - b[0]), R2 / (b[3] - b[1]));     // world pixels per Mercator unit at the UK view
    S.zUK = Math.log(S.wsUK / 512) / Math.LN2;
    S.mapEl.style.clipPath = 'circle(' + S.Rpx.toFixed(1) + 'px at ' + S.cx.toFixed(1) + 'px ' + S.cy.toFixed(1) + 'px)';
    S.mapEl.style.webkitClipPath = S.mapEl.style.clipPath;
    // stars behind everything: one offscreen canvas per layout
    var bg = S.bg || (S.bg = document.createElement('canvas'));
    bg.width = S.cv.width; bg.height = S.cv.height;
    var g = bg.getContext('2d'), n = Math.min(4000, Math.round(W * H / 2600)), seed = 12345, i;
    g.setTransform(sc, 0, 0, sc, 0, 0); g.clearRect(0, 0, W, H);
    for (i = 0; i < n; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0; var x = seed / 4294967296 * W;
      seed = (seed * 1664525 + 1013904223) >>> 0; var y = seed / 4294967296 * H;
      seed = (seed * 1664525 + 1013904223) >>> 0; g.globalAlpha = 0.08 + 0.2 * seed / 4294967296;
      g.fillStyle = '#a0beff'; g.fillRect(x, y, 1, 1);
    }
    g.globalAlpha = 1;
    // the sweep wedge: one conic gradient (anticlockwise arm, the wedge trails behind it)
    var ctx = S.ctx;
    S.wedge = null;
    if (ctx.createConicGradient) {
      S.wedge = ctx.createConicGradient(0, 0, 0);
      S.wedge.addColorStop(0, 'rgba(0,255,255,0.16)'); S.wedge.addColorStop(0.1, 'rgba(0,255,255,0)'); S.wedge.addColorStop(1, 'rgba(0,255,255,0)');
    }
    S.layoutN = (S.layoutN || 0) + 1;
    placeUI();
    if (S.map) { try { S.map.resize(); } catch (e) {} }
    S.camKey = '';
  }

  function placeUI() {
    var bh = S.phone ? 56 : 72, W = S.W, H = S.H, port = S.port, land = S.land, pad = 'env(safe-area-inset-top)', bot = 'env(safe-area-inset-bottom)';
    var band = (W - 2 * S.Rpx) / 2, i;
    S.allBtns.forEach(function (b) { b.style.height = bh + 'px'; b.style.minWidth = bh + 'px'; b.style.padding = S.phone ? '0 8px' : '0 16px'; });
    S.xbtn.style.width = S.xbtn.style.height = '72px';
    S.satB.textContent = S.phone ? 'SAT' : 'SATELLITE';
    // mute: top right beside X, except on a phone held upright, where it joins the left stack
    if (port) { if (S.mute.parentNode !== S.grpUD) S.grpUD.insertBefore(S.mute, S.grpUD.firstChild); S.mute.style.position = 'static'; }
    else { if (S.mute.parentNode !== S.ui) S.ui.appendChild(S.mute); S.mute.style.position = 'absolute'; S.mute.style.top = 'calc(8px + ' + pad + ')'; S.mute.style.right = 'calc(' + (8 + 72 + 8) + 'px + env(safe-area-inset-right))'; }
    S.cap.style.fontSize = S.phone ? '24px' : '26px'; S.cap.style.maxHeight = land ? '86px' : '62px';
    var sTop, sLeft, sw, cTop, cardTop, cw, cl;
    if (port) {          // caption, then the search box, then the card, all above the porthole
      S.cap.style.top = 'calc(16px + ' + pad + ')'; S.cap.style.right = '96px';
      sTop = 84; sLeft = 12; sw = W - 24; cardTop = 182; cw = W - 24; cl = 12;
    } else if (land) {   // search across the top, caption and card in the left band
      var edge = function (y) { var dy = Math.min(S.Rpx, Math.abs(S.cy - y)); return S.cx - Math.sqrt(S.Rpx * S.Rpx - dy * dy); };
      sTop = 8; sLeft = 8; sw = Math.max(220, edge(60) - 18);
      S.cap.style.top = 'calc(72px + ' + pad + ')'; S.cap.style.right = (W - Math.max(band, edge(130)) + 4) + 'px';
      cardTop = 172; cw = band - 16; cl = 8;
    } else {             // desktop: caption top left, search top right, card on the left
      S.cap.style.top = 'calc(16px + ' + pad + ')'; S.cap.style.right = (W - S.cx + S.Rpx * 0.15) + 'px';
      sw = clamp(W - S.cx - 8 - 72 - 8 - bh - 12 - 40, 260, 440); sTop = 10; sLeft = W - (8 + 72 + 8 + bh + 12) - sw;
      cardTop = 112; cw = Math.max(300, Math.min(400, band + 80)); cl = 16;
    }
    S.search.style.left = sLeft + 'px'; S.search.style.top = 'calc(' + sTop + 'px + ' + pad + ')'; S.search.style.width = sw + 'px'; S.search.style.right = '';
    S.input.style.height = S.goB.style.height = (S.phone ? 52 : 56) + 'px';
    S.goB.style.minWidth = (S.phone ? 56 : 72) + 'px';
    S.note.style.left = sLeft + 'px'; S.note.style.width = sw + 'px'; S.note.style.right = '';
    S.note.style.top = 'calc(' + (sTop + 60) + 'px + ' + pad + ')';
    S.card.style.width = cw + 'px'; S.card.style.left = cl + 'px';
    S.card.style.top = 'calc(' + cardTop + 'px + ' + pad + ')';
    S.card.style.maxHeight = Math.max(110, port ? S.cy - S.Rpx * 0.3 - cardTop : H - cardTop - bh - 40) + 'px';
    // bottom-left: GRID SUBS SPIDER (GridAtlas position)
    S.grpBL.style.left = 'calc(8px + env(safe-area-inset-left))'; S.grpBL.style.bottom = 'calc(8px + ' + bot + ')';
    if (port) {
      S.grpView.style.flexDirection = 'column'; S.grpView.style.right = '8px'; S.grpView.style.bottom = 'calc(' + (bh + 16) + 'px + ' + bot + ')';
      S.grpUD.style.flexDirection = 'column'; S.grpUD.style.right = ''; S.grpUD.style.left = '8px'; S.grpUD.style.bottom = 'calc(' + (bh + 16) + 'px + ' + bot + ')';
    } else {
      S.grpView.style.flexDirection = 'row'; S.grpView.style.right = 'calc(8px + env(safe-area-inset-right))'; S.grpView.style.bottom = 'calc(8px + ' + bot + ')';
      S.grpUD.style.flexDirection = 'column'; S.grpUD.style.left = ''; S.grpUD.style.right = 'calc(8px + env(safe-area-inset-right))'; S.grpUD.style.bottom = 'calc(' + (bh + 16) + 'px + ' + bot + ')';
    }
    // attribution: in free black space, never over the porthole
    S.att.style.left = S.att.style.right = S.att.style.top = S.att.style.bottom = S.att.style.width = '';
    if (port) { S.att.style.left = (8 + bh + 10) + 'px'; S.att.style.width = Math.max(150, W - 2 * (8 + bh + 10) - 50) + 'px'; S.att.style.bottom = 'calc(' + (bh + 16) + 'px + ' + bot + ')'; S.att.style.textAlign = 'left'; }
    else if (land) { S.att.style.right = 'calc(8px + env(safe-area-inset-right))'; S.att.style.width = (band - 16) + 'px'; S.att.style.top = 'calc(84px + ' + pad + ')'; S.att.style.textAlign = 'right'; }
    else { S.att.style.right = '16px'; S.att.style.width = Math.max(240, band - 24) + 'px'; S.att.style.bottom = 'calc(' + (bh + 16 + 2 * (bh + 6) + 6) + 'px + ' + bot + ')'; S.att.style.textAlign = 'right'; }
    S.ro.style.display = S.phone ? 'none' : 'block';
    S.ro.style.bottom = 'calc(' + (bh + 16) + 'px + ' + bot + ')';
    void i;
  }

  // ---------------- camera ----------------
  // z(D), the camera centre C(D) and the world scale ws = 512 * 2^z (MapLibre's own world size), shared by every layer
  function camera(D) {
    var cam = S.cam;
    if (D <= 2 || S.T < 0) {
      var z0 = D <= 2 ? S.zUK : S.zUK + (D - 2) * (ZEND - S.zUK) / (DMAX - 2);
      cam.z = z0; cam.ws = 512 * Math.pow(2, z0); cam.x = S.Cuk[0]; cam.y = S.Cuk[1];
    } else {
      var z = S.zUK + (D - 2) * (ZEND - S.zUK) / (DMAX - 2), ws = 512 * Math.pow(2, z), f = (S.wsUK / ws) * (1 - smooth((D - 2) / 2.5));
      var tx = D0.m[2 * S.T], ty = D0.m[2 * S.T + 1];
      cam.z = z; cam.ws = ws; cam.x = tx + (S.Cuk[0] - tx) * f; cam.y = ty + (S.Cuk[1] - ty) * f;
    }
    if (S.corrA > 0.001) { cam.x += S.corrX * S.corrA / cam.ws; cam.y += S.corrY * S.corrA / cam.ws; }
    return cam;
  }
  function setTarget(i, smoothly) {
    if (i === S.T) return;
    if (smoothly && S.D > 2) {          // keep the view continuous: carry the old camera as an offset that fades out
      var a = camera(S.D), ox = a.x, oy = a.y, ws = a.ws, oldA = S.corrA;
      S.corrA = 0; S.T = i; var b = camera(S.D);
      S.corrX = (ox - b.x) * ws; S.corrY = (oy - b.y) * ws; S.corrA = 1; void oldA;
    } else { S.T = i; S.corrA = 0; }
    S.spider = null; S.spiderT0 = performance.now();
    S.cardDirty = true;
  }

  // ---------------- the real map (GridAtlas's own library and sources) ----------------
  function wantMap() { return S.view !== 'kuiper'; }
  function loadMap() {
    if (S.mapState !== 'none') return;
    S.mapState = 'loading';
    var go = function () {
      if (!S) return;
      if (!window.maplibregl) { mapFailed('lib'); return; }
      try {
        var cam = camera(S.D);
        S.map = new window.maplibregl.Map({
          container: S.mapEl, style: DARK_STYLE, center: [cam.x * 360 - 180, unmercLat(cam.y)], zoom: Math.max(0, cam.z),
          interactive: false, attributionControl: false, pixelRatio: S.sc, fadeDuration: 150, maxZoom: 19.5
        });
      } catch (e) { mapFailed('webgl'); return; }
      S.mapT0 = performance.now(); S.tileOK = 0; S.tileErr = 0;
      S.map.on('load', function () {
        if (!S || !S.map) return;
        try {
          // GridAtlas engine :1353-1354, verbatim tiles: the satellite raster, hidden until SATELLITE is chosen
          S.map.addSource('sat-s', { type: 'raster', tiles: [SAT_TILES], tileSize: 256 });
          S.map.addLayer({ id: 'l-sat', type: 'raster', source: 'sat-s', layout: { visibility: S.view === 'sat' ? 'visible' : 'none' } });
          GA_LINES.forEach(function (L) {
            S.map.addSource('ga' + L[0], { type: 'geojson', data: GA_DATA + 'grid_' + L[0] + 'kv.geojson' });
            S.map.addLayer({ id: 'ga' + L[0], type: 'line', source: 'ga' + L[0], layout: { visibility: S.grid ? 'visible' : 'none' },
              paint: { 'line-color': L[1], 'line-width': L[2], 'line-opacity': 0.9 } });
          });
        } catch (e) {}
        S.mapState = 'ready'; S.camKey = '';
      });
      S.map.on('data', function (e) { if (S && e && e.tile) S.tileOK++; if (S && e && e.sourceId && /^ga/.test(e.sourceId) && e.isSourceLoaded) S.gaLines = true; });
      S.map.on('error', function () { if (S) S.tileErr++; });
    };
    if (window.maplibregl) { go(); return; }
    if (!document.querySelector('link[data-descent-maplibre]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = MAPLIBRE_CSS; l.setAttribute('data-descent-maplibre', '1'); document.head.appendChild(l);
    }
    var done = false;
    S.libTimer = setTimeout(function () { if (!done) { done = true; mapFailed('lib'); } }, 12000);
    loadScript(MAPLIBRE_JS, function (ok) { if (done) return; done = true; clearTimeout(S && S.libTimer); if (ok && S) go(); else mapFailed('lib'); });
  }
  function mapFailed(why) {
    if (!S) return;
    S.mapState = 'failed'; S.mapWhy = why;
    if (S.map) { try { S.map.remove(); } catch (e) {} S.map = null; }
    S.mapEl.style.visibility = 'hidden';
    caption(why === 'webgl' ? 'THIS BROWSER CANNOT DRAW THE REAL MAP' : 'REAL MAP NEEDS THE INTERNET');
    S.attDirty = true;
  }
  function checkTiles(now) {   // tiles never arrived: say so in one line, keep the stars
    if (S.mapState === 'ready' || S.mapState === 'loading') {
      if (S.map && S.tileOK === 0 && now - S.mapT0 > 9000) mapFailed('net');
    }
  }
  function syncMap(alpha) {
    var m = S.map, vis = alpha > 0.005 && S.mapState === 'ready';
    if (vis !== S.mapVis) { S.mapVis = vis; S.mapEl.style.visibility = vis ? 'visible' : 'hidden'; }
    if (!vis || !m) return;
    if (Math.abs(alpha - S.mapA) > 0.01) { S.mapA = alpha; S.mapEl.style.opacity = alpha.toFixed(3); }
    var cam = S.cam, key = cam.x.toFixed(10) + cam.y.toFixed(10) + cam.z.toFixed(4);
    if (key !== S.camKey) {
      S.camKey = key;
      try { m.jumpTo({ center: [cam.x * 360 - 180, unmercLat(cam.y)], zoom: Math.max(0, cam.z) }); } catch (e) {}
    }
  }
  function setView(v, byUser) {
    if (v === S.view) return;
    S.view = v; if (byUser) S.viewTouched = true;
    S.viewBtns.forEach(function (b) { lit(b, b.dataset.v === v); });
    if (v !== 'kuiper') loadMap();
    if (S.map && S.mapState === 'ready') { try { S.map.setLayoutProperty('l-sat', 'visibility', v === 'sat' ? 'visible' : 'none'); } catch (e) {} }
    if (v === 'sat' && S.D > 2.5) caption('THE REAL GROUND, FROM ABOVE');
    else if (v === 'map' && S.D > 2.5) caption('THE REAL MAP');
    else if (v === 'kuiper') caption('THE STARS ONLY');
    S.attDirty = true;
  }

  // ---------------- search: type a name, lights guide the eye ----------------
  function doSearch() {
    var q = S.input.value || '';
    if (q.length > 80) { q = q.slice(0, 80); S.input.value = q; }
    q = q.trim().toLowerCase(); S.mN = 0; S.mTotal = 0;
    if (!q) { S.note.textContent = ''; S.q = ''; S.cap.style.visibility = 'visible'; return; }
    S.q = q;
    var low = D0.low, n = D0.n, cap = S.mIdx.length;
    for (var i = 0; i < n; i++) {
      if (low[i] && low[i].indexOf(q) >= 0) { if (S.mN < cap) S.mIdx[S.mN++] = i; S.mTotal++; }
    }
    if (S.land) S.cap.style.visibility = 'hidden';
    if (!S.mTotal) S.note.textContent = 'NO SUBSTATION NAME HERE CONTAINS THAT';
    else if (S.mTotal === 1) S.note.textContent = 'ONE MATCH. PRESS GO';
    else S.note.textContent = fmt(S.mTotal) + ' MATCHES' + (S.mTotal > S.mN ? ', ' + S.mN + ' LIT' : '') + '. KEEP TYPING';
  }
  function bestMatch() {
    if (!S.mN) return -1;
    for (var k = 0; k < S.mN; k++) if (D0.low[S.mIdx[k]] === S.q) return S.mIdx[k];
    return S.mIdx[0];
  }
  function goSearch() {
    doSearch();
    var i = bestMatch();
    if (i < 0) { S.note.textContent = S.q ? 'NO SUBSTATION NAME HERE CONTAINS THAT. TRY ANOTHER NAME' : 'TYPE A SUBSTATION NAME, THEN GO'; return; }
    S.input.blur(); S.note.textContent = ''; S.cap.style.visibility = 'visible';
    flyTo(i);
  }
  // the flight: first up to the whole Kuiper field, then down through the porthole to that exact substation
  function flyTo(i) {
    audio();
    S.flight = { phase: S.D > 0.15 ? 'up' : 'down', T: i };
    S.Dgoal = 0; S.speed = 3.2; hideCard();
    caption(S.flight.phase === 'up' ? 'UP TO THE STARS FIRST' : 'DOWN TO ' + nameOf(i).toUpperCase());
    if (S.flight.phase === 'down') { setTarget(i, false); S.Dgoal = DMAX; }
    if (S.view !== 'kuiper') loadMap();
  }

  // ---------------- SPIDER: the grid engine pack when present, otherwise nearest by distance ----------------
  function findSite(i) {   // feature-detected against modules/grid-engine-pack.js (KGEngine) and grid-topology-data.js
    var E = window.KGEngine, T = window.KGGridTopology; if (!E || !T) return null;
    try {
      if (typeof E.siteFor === 'function') { var s0 = E.siteFor(D0.lat[i], D0.lon[i], D0.names[i]); if (s0) return s0; }
      if (typeof E.matchSite === 'function') { var s1 = E.matchSite(D0.lat[i], D0.lon[i], D0.names[i]); if (s1) return s1; }
      var sites = T.sites || T.nodes || [], list = Array.isArray(sites) ? sites : Object.keys(sites).map(function (k) { var o = sites[k]; if (o && o.key == null) o.key = k; return o; });
      var best = null, bd = 1.5, nm = D0.low[i];
      for (var k = 0; k < list.length && k < 5000; k++) {
        var o = list[k]; if (!o) continue;
        var la = +(o.lat != null ? o.lat : o.latitude), lo = +(o.lon != null ? o.lon : (o.lng != null ? o.lng : o.longitude));
        if (!isFinite(la) || !isFinite(lo)) continue;
        var dx = (lo - D0.lon[i]) * 111.32 * Math.cos(la * Math.PI / 180), dy = (la - D0.lat[i]) * 110.57, d = Math.sqrt(dx * dx + dy * dy);
        var named = nm && o.name && String(o.name).toLowerCase().indexOf(nm.split(' ')[0]) >= 0;
        if (d < bd || (named && d < 5 && d < bd + 3)) { bd = d; best = o; }
      }
      return best ? (best.key != null ? best.key : (best.site != null ? best.site : best.id)) : null;
    } catch (e) { return null; }
  }
  function buildSpider() {
    var i = S.T; if (i < 0) return null;
    var E = window.KGEngine, out = { from: i, arrows: [], listed: [], kind: 'distance', caveat: '' };
    var site = findSite(i);
    if (site != null && E && typeof E.spiderFrom === 'function') {
      try {
        var res = E.spiderFrom(site, { maxHops: S.hops }) || [];
        for (var k = 0; k < res.length && k < 60; k++) {
          var r = res[k];
          if (r.hasCoordinates === false || !isFinite(+r.lat) || !isFinite(+r.lon)) { out.listed.push(String(r.toSite)); continue; }
          var mm = new Float64Array(2); merc(+r.lon, +r.lat, mm, 0);
          out.arrows.push({ mx: mm[0], my: mm[1], km: +r.km, label: (isFinite(+r.km) ? (+r.km).toFixed(1) + ' KM' : '') + (r.hops > 1 ? '  ' + r.hops + ' HOPS' : ''),
            name: String(r.toSite), kv: r.voltage, cable: /cable/i.test(String(r.kind || '')), corridor: r.corridorKm || r.corridor || null, hops: r.hops || 1 });
        }
        out.kind = 'published';
        var cv = E.caveats || E.CAVEATS || (E.spiderCaveats) || null;
        out.caveat = cv ? (Array.isArray(cv) ? cv.join('; ') : (typeof cv === 'object' ? Object.keys(cv).map(function (q) { return cv[q]; }).join('; ') : String(cv))) : '';
        return out;
      } catch (e) { /* fall through to distance */ }
    }
    var near = null;
    if (E && typeof E.nearestByDistance === 'function') {
      try { near = E.nearestByDistance(D0.lat[i], D0.lon[i], 7); } catch (e) { near = null; }
    }
    if (near && near.length) {
      for (var a = 0; a < near.length && out.arrows.length < 6; a++) {
        var q = near[a], la = +(q.lat != null ? q.lat : q.latitude), lo = +(q.lon != null ? q.lon : q.longitude);
        if (!isFinite(la) || !isFinite(lo)) continue;
        if (Math.abs(la - D0.lat[i]) < 1e-6 && Math.abs(lo - D0.lon[i]) < 1e-6) continue;
        var m2 = new Float64Array(2); merc(lo, la, m2, 0);
        out.arrows.push({ mx: m2[0], my: m2[1], km: +q.km, label: (+q.km).toFixed(1) + ' KM', name: String(q.name || ''), hops: 1 });
      }
      out.kind = 'engine-distance'; return out;
    }
    // no pack: our own great-circle nearest six from the public substation file (coincident duplicates skipped)
    var bestI = [-1, -1, -1, -1, -1, -1], bestD = [1e9, 1e9, 1e9, 1e9, 1e9, 1e9], j, t;
    for (j = 0; j < D0.n; j++) {
      if (j === i) continue; var d = km(i, j); if (d < 0.05 || d >= bestD[5]) continue;
      for (t = 5; t > 0 && bestD[t - 1] > d; t--) { bestD[t] = bestD[t - 1]; bestI[t] = bestI[t - 1]; }
      bestD[t] = d; bestI[t] = j;
    }
    for (t = 0; t < 6; t++) if (bestI[t] >= 0) out.arrows.push({ mx: D0.m[2 * bestI[t]], my: D0.m[2 * bestI[t] + 1], km: bestD[t], label: bestD[t].toFixed(1) + ' KM', name: nameOf(bestI[t]), sub: bestI[t], hops: 1 });
    return out;
  }
  function spiderCaption() {
    if (!S.spider) return;
    caption(S.spider.kind === 'published' ? 'PUBLISHED CIRCUITS, NESO ETYS 2025' : 'NEAREST BY DISTANCE, NOT CONNECTIONS');
  }

  // ---------------- drawing ----------------
  function frame(now) {
    if (!S) return;
    S.raf = requestAnimationFrame(frame);
    var t0 = performance.now(); if (S.last) S.fiv[S.fj++ % S.fiv.length] = now - S.last;
    var dt = Math.min(0.1, Math.max(0.001, (now - (S.last || now)) / 1000)); S.last = now;
    // the one control: D eases toward its goal, with a speed cap so a huge wheel turn is still a fall, not a cut
    if (S.hold) S.Dgoal = clamp(S.Dgoal + S.hold * dt * 1.3, 0, DMAX);
    var Dp = S.D, step = (S.Dgoal - S.D) * Math.min(1, dt * 3.2), cap = S.speed * dt;
    S.D += clamp(step, -cap, cap); if (Math.abs(S.Dgoal - S.D) < 1e-4) S.D = S.Dgoal;
    var moving = Math.abs(S.D - Dp) / dt;
    if (S.flight) {
      if (S.flight.phase === 'up' && S.D < 0.06) { S.flight.phase = 'down'; setTarget(S.flight.T, false); S.Dgoal = DMAX; caption('DOWN TO ' + nameOf(S.flight.T).toUpperCase()); }
      else if (S.flight.phase === 'down' && S.D > DMAX - 0.02) { S.flight = null; S.speed = 2.4; arrive(); }
    }
    if (S.D > 1.9 && S.T < 0) setTarget(nearestToCentre(), false);
    if (S.corrA > 0) S.corrA = Math.max(0, S.corrA - dt * 1.6);
    fallTone(moving);
    S.sw = (S.sw + (S.scan && !S.grab ? dt * Math.PI / 3 : 0)) % (2 * Math.PI);   // 60 degrees a second, anticlockwise
    var cam = camera(S.D);
    if (!S.viewTouched && S.view === 'map' && cam.z >= 15 && S.mapState === 'ready') { setView('sat', false); }
    if (wantMap() && S.mapState === 'none' && S.D > 1.4) loadMap();
    checkTiles(now);
    var mapA = (wantMap() && S.mapState === 'ready') ? smooth((S.D - 2.3) / 0.9) : 0;
    syncMap(mapA);
    stageCaption();
    render(cam, mapA, now);
    if (S.cardDirty && S.T >= 0 && S.D > 2.6) { S.cardDirty = false; showCard(); }
    if (S.D < 2.4 && S.cardOn) hideCard();
    if (now - S.roT > 150) { S.roT = now; readout(cam); }
    if (S.attDirty) { S.attDirty = false; attrib(); }
    var ft = performance.now() - t0; S.ft[S.fi++ % S.ft.length] = ft;
    if (S.fi > 30 && S.fi % 30 === 0) { var avg = 0; for (var k = 0; k < S.ft.length; k++) avg += S.ft[k]; avg /= S.ft.length; S.lite = avg > 14; }
  }

  function nearestToCentre() {
    var best = 0, bd = 1e18, cx = S.Cuk[0], cy = S.Cuk[1];
    for (var i = 0; i < D0.n; i++) { if (!D0.names[i]) continue; var dx = D0.m[2 * i] - cx, dy = D0.m[2 * i + 1] - cy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
    return best;
  }

  function render(cam, mapA, now) {
    var g = S.ctx, W = S.W, H = S.H, cx = S.cx, cy = S.cy, R = S.Rpx, D = S.D, i, n = S.NP;
    g.setTransform(S.sc, 0, 0, S.sc, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    // black everywhere outside the porthole; inside it, black that thins as the real map fades in under it
    g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, R, 0, 2 * Math.PI, true); g.fill('evenodd');
    if (mapA < 1) { g.globalAlpha = 1 - mapA; g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.fill(); }
    g.globalAlpha = 1 - mapA * 0.85; g.drawImage(S.bg, 0, 0, W, H); g.globalAlpha = 1;

    // where each star is now: Kuiper place, blending to its substation (Web Mercator, the same mapping as the map)
    var u = clamp(D - 1, 0, 1), ks = R / S.Rw, ws = (D < 2 ? S.wsUK : cam.ws);
    var mx0 = D < 2 ? S.Cuk[0] : cam.x, my0 = D < 2 ? S.Cuk[1] : cam.y, col = 1 - smooth(D - 2), M = D0.m;
    var sx = S.sx, sy = S.sy, kx = S.kx, ky = S.ky, ps = S.pSub, ox = S.ox, oy = S.oy, dl = S.delay;
    for (i = 0; i < n; i++) {
      var s = ps[i], gx = cx + (M[2 * s] - mx0) * ws + ox[i] * col, gy = cy + (M[2 * s + 1] - my0) * ws + oy[i] * col;
      if (u <= 0) { sx[i] = cx + kx[i] * ks; sy[i] = cy - ky[i] * ks; }
      else if (u >= 1) { sx[i] = gx; sy[i] = gy; }
      else { var v = ease(clamp((u - dl[i]) / 0.7, 0, 1)), qx = cx + kx[i] * ks, qy = cy - ky[i] * ks; sx[i] = qx + (gx - qx) * v; sy[i] = qy + (gy - qy) * v; }
    }

    instruments(g, cam);
    if (S.grid && D > 1.6) drawLines(g, cam, mapA, smooth((D - 1.6) / 0.5));
    sweep(g);

    // the stars: the brightest thing on screen (halo, core, then the ones the arm has just crossed)
    var subsA = S.subs ? 1 : 1 - smooth((D - 1.2) / 0.8), sz = S.phone ? 1.8 : 2.1, hz = sz * 3.2, L = -12, Rr = W + 12, B = H + 12;
    g.save(); if (D >= 1.95) { g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.clip(); }
    g.globalCompositeOperation = 'lighter';
    if (subsA > 0.01) {
      // halo and core: drawn into a cached layer, redrawn only when a star has moved
      var key = D.toFixed(5) + '|' + cam.x.toFixed(9) + cam.y.toFixed(9) + cam.z.toFixed(5) + '|' + subsA.toFixed(3) + (S.lite ? 'L' : '') + S.layoutN;
      var still = key === S.starKey;
      if (!still) {
        var sl = S.starCv, h = S.starCtx;
        if (sl.width !== S.cv.width || sl.height !== S.cv.height) { sl.width = S.cv.width; sl.height = S.cv.height; }
        h.setTransform(S.sc, 0, 0, S.sc, 0, 0); h.clearRect(0, 0, W, H); h.globalCompositeOperation = 'lighter';
        if (!S.lite && Math.abs(S.D - S.Dgoal) < 0.01) {   // the halo only when the stars are at rest
          h.fillStyle = 'rgba(0,255,255,0.10)'; h.beginPath();
          for (i = 0; i < n; i++) { var x = sx[i], y = sy[i]; if (x > L && x < Rr && y > L && y < B) h.rect(x - hz / 2, y - hz / 2, hz, hz); }
          h.fill();
        }
        h.fillStyle = 'rgba(220,255,255,0.95)'; h.beginPath();
        for (i = 0; i < n; i++) { var x2 = sx[i], y2 = sy[i]; if (x2 > L && x2 < Rr && y2 > L && y2 < B) h.rect(x2 - sz / 2, y2 - sz / 2, sz, sz); }
        h.fill();
        S.starKey = key; S.bucketsOK = false;
      }
      g.globalAlpha = subsA; g.drawImage(S.starCv, 0, 0, W, H);
      // sweep light: stars in the 34 degrees behind the arm glow brighter. When the stars are still, they are sorted
      // once into 360 bearing buckets, so each frame only looks at the stars inside the wedge.
      if (S.scan || S.grab) {
        var arm = -S.sw, big = sz * 2.2, TW = 6.283185307179586, bs = S.bStart, bi = S.bItem;
        if (still && !S.bucketsOK) {
          var cnt = S.bCnt; cnt.fill(0);
          for (i = 0; i < n; i++) { var a0 = Math.atan2(sy[i] - cy, sx[i] - cx); a0 -= TW * Math.floor(a0 / TW); var q = (a0 * 360 / TW) | 0; if (q > 359) q = 359; S.bOf[i] = q; cnt[q]++; }
          bs[0] = 0; for (var q2 = 0; q2 < 360; q2++) bs[q2 + 1] = bs[q2] + cnt[q2];
          cnt.fill(0); for (i = 0; i < n; i++) { var qq = S.bOf[i]; bi[bs[qq] + cnt[qq]++] = i; }
          S.bucketsOK = true;
        }
        g.fillStyle = 'rgba(200,255,255,0.55)'; g.beginPath();
        if (still && S.bucketsOK) {
          var am = arm - TW * Math.floor(arm / TW), q0 = (am * 360 / TW) | 0;
          for (var w = 0; w < 36; w++) {
            var qb = (q0 + w) % 360;
            for (var t = bs[qb]; t < bs[qb + 1]; t++) {
              var j2 = bi[t], x4 = sx[j2], y4 = sy[j2]; if (x4 < L || x4 > Rr || y4 < L || y4 > B) continue;
              var d4 = Math.atan2(y4 - cy, x4 - cx) - arm; d4 -= TW * Math.floor(d4 / TW);
              if (d4 < 0.6) { var b4 = big * (1 - d4 / 0.6) + sz; g.rect(x4 - b4 / 2, y4 - b4 / 2, b4, b4); }
            }
          }
        } else {
          for (i = 0; i < n; i++) {
            var x3 = sx[i], y3 = sy[i]; if (x3 < L || x3 > Rr || y3 < L || y3 > B) continue;
            var dd = Math.atan2(y3 - cy, x3 - cx) - arm; dd -= TW * Math.floor(dd / TW);
            if (dd < 0.6) { var b = big * (1 - dd / 0.6) + sz; g.rect(x3 - b / 2, y3 - b / 2, b, b); }
          }
        }
        g.fill();
      }
    }
    // search lights: every matching star lit amber
    if (S.mN) {
      g.globalAlpha = 1; g.fillStyle = 'rgba(255,176,0,0.9)'; g.beginPath();
      for (var k = 0; k < S.mN; k++) { var j = S.mIdx[k]; g.rect(sx[j] - 3, sy[j] - 3, 6, 6); }
      g.fill();
    }
    g.restore(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    if (S.mN && S.q) rimLights(g);
    if (S.spiderOn && S.T >= 0 && D > 2.4) drawSpider(g, cam, now);
    if (S.T >= 0 && D > 1.0) drawTarget(g, cam);
  }

  function instruments(g, cam) {
    var cx = S.cx, cy = S.cy, R = S.Rpx, i;
    g.lineWidth = 1; g.strokeStyle = 'rgba(0,255,255,0.18)';
    for (i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, R * i / 4, 0, 2 * Math.PI); g.stroke(); }
    g.strokeStyle = 'rgba(0,255,255,0.5)'; g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.stroke();
    for (i = 0; i < 360; i += 5) {
      var a = (i - 90) * Math.PI / 180, l = i % 30 === 0 ? 14 : (i % 10 === 0 ? 8 : 4);
      g.strokeStyle = i % 30 === 0 ? 'rgba(0,255,255,0.45)' : 'rgba(0,255,255,0.22)';
      g.beginPath(); g.moveTo(cx + Math.cos(a) * (R + 3), cy + Math.sin(a) * (R + 3)); g.lineTo(cx + Math.cos(a) * (R + 3 + l), cy + Math.sin(a) * (R + 3 + l)); g.stroke();
    }
    // the outer ring states its own range: wafer units among the stars, metres or km over the Earth
    var lab;
    if (S.D < 1.5) lab = 'R ' + fmt(S.Rw);
    else {
      var lat = unmercLat(cam.y), mpp = 40075016.686 * Math.cos(lat * Math.PI / 180) / (S.D < 2 ? S.wsUK : cam.ws), m = mpp * R;
      lab = m >= 2000 ? fmt(m / 1000) + ' KM' : fmt(m) + ' M';
    }
    if (!S.phone || S.D > 2) {
      g.font = '24px ' + FONT; g.fillStyle = 'rgba(102,204,255,0.75)'; g.textAlign = 'left'; g.textBaseline = 'middle';
      if (S.port) { g.textAlign = 'center'; g.fillText(lab, cx, cy + R - 20); }
      else { var la = S.land ? -Math.PI / 4 : Math.PI / 4; g.fillText(lab, cx + Math.cos(la) * (R + 22), cy + Math.sin(la) * (R + 22) + (S.land ? -8 : 8)); }
    }
  }

  function sweep(g) {
    var cx = S.cx, cy = S.cy, R = S.Rpx, arm = -S.sw;
    if (!S.scan && !S.grab) return;
    g.save(); g.translate(cx, cy); g.rotate(arm);
    if (S.wedge) { g.fillStyle = S.wedge; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, 0, 0.62); g.closePath(); g.fill(); }
    else { for (var k = 0; k < 6; k++) { g.fillStyle = 'rgba(0,255,255,' + (0.025 * (6 - k) / 6).toFixed(3) + ')'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, k * 0.1, (k + 1) * 0.1); g.closePath(); g.fill(); } }
    g.strokeStyle = 'rgba(0,255,255,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(R, 0); g.stroke();
    g.restore();
    // a soft ping when the arm crosses the selected substation
    if (S.T >= 0) {
      var a = Math.atan2(S.sy[S.T] - cy, S.sx[S.T] - cx), d = a - arm; d -= 6.283185307179586 * Math.floor(d / 6.283185307179586);
      if (d < 0.08 && !S.pinged) { S.pinged = true; if (S.D < 7.9) ping(7, 0.02); } else if (d > 0.3) S.pinged = false;
    }
  }

  function drawLines(g, cam, mapA, a) {
    var Ls = decodeLines(); if (!Ls) return;
    // when GridAtlas's own exact line files are drawing in the map, the simplified lines step back
    var ga = (S.mapState === 'ready' && S.gaLines) ? mapA : 0, alpha = a * (1 - ga) * 0.85;
    if (alpha < 0.01) return;
    var ws = S.D < 2 ? S.wsUK : cam.ws, x0 = S.D < 2 ? S.Cuk[0] : cam.x, y0 = S.D < 2 ? S.Cuk[1] : cam.y, cx = S.cx, cy = S.cy, W = S.W, H = S.H;
    var sets = [['grid132', '#00cc00', 1.2], ['grid400', '#0054ff', 2.2]];
    g.save(); g.beginPath(); g.arc(cx, cy, S.Rpx, 0, 2 * Math.PI); g.clip();
    g.globalAlpha = alpha;
    for (var q = 0; q < 2; q++) {
      var Lq = Ls[sets[q][0]]; if (!Lq) continue;
      var m = Lq.m, seg = Lq.seg, ns = Lq.ns;
      g.strokeStyle = sets[q][1]; g.lineWidth = sets[q][2]; g.beginPath();
      for (var e = 0; e < ns; e++) {
        var A = seg[2 * e], B = seg[2 * e + 1];
        var ax = cx + (m[2 * A] - x0) * ws, ay = cy + (m[2 * A + 1] - y0) * ws, bx = cx + (m[2 * B] - x0) * ws, by = cy + (m[2 * B + 1] - y0) * ws;
        if ((ax < 0 && bx < 0) || (ax > W && bx > W) || (ay < 0 && by < 0) || (ay > H && by > H)) continue;
        g.moveTo(ax, ay); g.lineTo(bx, by);
      }
      g.stroke();
    }
    g.restore();
  }

  function rimLights(g) {
    var cx = S.cx, cy = S.cy, R = S.Rpx + 22, n = S.mN, k;
    g.save(); g.globalCompositeOperation = 'lighter';
    if (n === 1 || S.mTotal === 1) {
      var j = S.mIdx[0], a = Math.atan2(S.sy[j] - cy, S.sx[j] - cx), rx = cx + Math.cos(a) * R, ry = cy + Math.sin(a) * R;
      var gr = g.createLinearGradient(rx, ry, S.sx[j], S.sy[j]);
      gr.addColorStop(0, 'rgba(255,176,0,0.9)'); gr.addColorStop(1, 'rgba(255,176,0,0.15)');
      g.strokeStyle = gr; g.lineWidth = 3; g.beginPath(); g.moveTo(rx, ry); g.lineTo(S.sx[j], S.sy[j]); g.stroke();
      g.fillStyle = 'rgba(255,176,0,0.95)'; g.beginPath(); g.arc(rx, ry, 7, 0, 2 * Math.PI); g.fill();
      g.strokeStyle = 'rgba(255,176,0,0.9)'; g.lineWidth = 2; g.beginPath(); g.arc(S.sx[j], S.sy[j], 12, 0, 2 * Math.PI); g.stroke();
    } else {
      g.fillStyle = 'rgba(255,176,0,0.55)';
      for (k = 0; k < n; k++) {
        var i = S.mIdx[k], b = Math.atan2(S.sy[i] - cy, S.sx[i] - cx);
        g.beginPath(); g.arc(cx + Math.cos(b) * R, cy + Math.sin(b) * R, 4, 0, 2 * Math.PI); g.fill();
      }
    }
    g.restore();
  }

  function drawTarget(g, cam) {
    var i = S.T, x = S.sx[i], y = S.sy[i], deep = S.D > 4.5;
    g.save(); g.strokeStyle = C.amber; g.lineWidth = 2;
    // crosshair with a clear middle, so the real compound stays visible under it
    var r = deep ? 26 : 12;
    g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.stroke();
    if (deep) {
      g.lineWidth = 1.5; g.beginPath();
      g.moveTo(x - r - 14, y); g.lineTo(x - r + 6, y); g.moveTo(x + r - 6, y); g.lineTo(x + r + 14, y);
      g.moveTo(x, y - r - 14); g.lineTo(x, y - r + 6); g.moveTo(x, y + r - 6); g.lineTo(x, y + r + 14); g.stroke();
      g.fillStyle = C.amber; g.beginPath(); g.arc(x, y, 1.6, 0, 2 * Math.PI); g.fill();
    }
    // engineering leader from the substation to its card
    if (S.cardOn && S.D > 2.6) {
      var cr = S.card.getBoundingClientRect(), hr = S.host.getBoundingClientRect();
      var lx = cr.right - hr.left, ly = cr.top - hr.top + 24;
      if (S.port) { lx = cr.left - hr.left + cr.width * 0.5; ly = cr.bottom - hr.top; }
      g.setLineDash([6, 5]); g.strokeStyle = 'rgba(255,176,0,0.6)'; g.lineWidth = 1;
      var ang = Math.atan2(ly - y, lx - x);
      g.beginPath(); g.moveTo(x + Math.cos(ang) * (r + 4), y + Math.sin(ang) * (r + 4)); g.lineTo(lx, ly); g.stroke(); g.setLineDash([]);
    }
    g.restore();
  }

  function drawSpider(g, cam, now) {
    if (!S.spider || S.spider.from !== S.T) { S.spider = buildSpider(); S.spiderT0 = now; spiderCaption(); S.cardDirty = true; }
    var sp = S.spider; if (!sp) return;
    var cx = S.cx, cy = S.cy, R = S.Rpx, ws = cam.ws, x0 = S.sx[S.T], y0 = S.sy[S.T], t = (now - S.spiderT0) / 1000;
    var mpp = 40075016.686 * Math.cos(D0.lat[S.T] * Math.PI / 180) / ws;   // metres per screen pixel here
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.clip();
    for (var k = 0; k < sp.arrows.length && k < 60; k++) {
      var A = sp.arrows[k], tx = cx + (A.mx - cam.x) * ws, ty = cy + (A.my - cam.y) * ws;
      var dx = tx - x0, dy = ty - y0, len = Math.sqrt(dx * dx + dy * dy); if (len < 2) continue;
      var p = smooth((t - k * 0.15) / 1.1); if (p <= 0) continue;
      var ux = dx / len, uy = dy / len, ex = x0 + dx * p, ey = y0 + dy * p;
      var colr = A.kv >= 400 ? '#4d8bff' : (A.kv >= 275 ? '#ff5555' : (sp.kind === 'published' ? '#22ee77' : C.amber));
      // PYLONS: towers stand up along the arrow as it grows, conductors sag between them (an illustration, not a route)
      // towers only on a published overhead circuit; a cable is drawn dashed; a distance arrow carries no towers at all
      var gap = S.phone ? 54 : 70, nT = (sp.kind === 'published' && !A.cable) ? Math.min(40, Math.floor(len * p / gap)) : 0;
      g.strokeStyle = colr; g.lineWidth = 1.2; g.globalAlpha = 0.85;
      var hpx = S.phone ? 16 : 20;
      for (var q = 1; q <= nT; q++) tower(g, x0 + ux * gap * q, y0 + uy * gap * q, hpx);
      g.beginPath();
      var px = x0, py = y0 - hpx * 0.9;
      for (q = 1; q <= nT; q++) { var qx = x0 + ux * gap * q, qy = y0 + uy * gap * q - hpx * 0.9; g.moveTo(px, py); g.quadraticCurveTo((px + qx) / 2, (py + qy) / 2 + 7, qx, qy); px = qx; py = qy; }
      g.stroke();
      // the arrow itself, with an arrowhead where it has reached (spider look: ventus-grid-engine index.html spokes)
      g.globalAlpha = 1; g.lineWidth = 2; if (sp.kind !== 'published' || A.cable) g.setLineDash(A.cable ? [10, 6] : [4, 6]);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
      g.fillStyle = colr; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - ux * 14 - uy * 7, ey - uy * 14 + ux * 7); g.lineTo(ex - ux * 14 + uy * 7, ey - uy * 14 - ux * 7); g.closePath(); g.fill();
      if (p > 0.95) {
        // label at the far end if it is inside the porthole, otherwise where the arrow meets the rim
        var lx = tx, ly = ty, rr = Math.sqrt((tx - cx) * (tx - cx) + (ty - cy) * (ty - cy));
        if (rr > R - 40) { var bx = x0 - cx, by = y0 - cy, bb = bx * ux + by * uy, cc = bx * bx + by * by - (R - 50) * (R - 50), s = -bb + Math.sqrt(Math.max(0, bb * bb - cc)); lx = x0 + ux * s; ly = y0 + uy * s; }
        g.font = 'bold 24px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
        var txt = A.label + (A.cable && A.corridor ? '  ROUTE EST ' + (+A.corridor).toFixed(1) + ' KM' : '');
        g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.strokeText(txt, lx, ly); g.fillStyle = colr; g.fillText(txt, lx, ly);
      }
    }
    void mpp;
    g.restore();
  }
  function tower(g, x, y, h) {   // a lattice tower glyph, proportions from TOWER (400 kV class), base at (x, y)
    var k = h / TOWER.H, bw = TOWER.base * k * 1.6, top = y - h;
    g.beginPath();
    g.moveTo(x - bw, y); g.lineTo(x - 1, top); g.lineTo(x + 1, top); g.lineTo(x + bw, y);
    g.moveTo(x - bw, y); g.lineTo(x + bw * 0.45, y - h * 0.4); g.moveTo(x + bw, y); g.lineTo(x - bw * 0.45, y - h * 0.4);
    for (var a = 0; a < 3; a++) { var zy = y - h * TOWER.armZ[a], al = TOWER.arm[a] * k * 0.9; g.moveTo(x - al, zy); g.lineTo(x + al, zy); }
    g.stroke();
  }

  // ---------------- words on screen ----------------
  var STAGES = ['THE KUIPER: A STAR FOR EVERY LINE OF CODE', 'THE STARS GATHER INTO THE GRID', 'ONE REGION', 'ONE SUBSTATION'];
  function stageOf(D) { return D < 0.9 ? 0 : (D < 1.95 ? 1 : (D < 3.6 ? 2 : 3)); }
  function stageCaption() {
    var st = stageOf(S.D);
    if (st !== S.stage) {
      S.stage = st;
      if (!S.flight || st === 3) caption(st === 3 && S.T >= 0 ? 'ONE SUBSTATION: ' + nameOf(S.T).toUpperCase() : STAGES[st]);
      S.attDirty = true;
    }
    var mapShown = S.mapVis ? 1 : 0;
    if (mapShown !== S.mapShownC) { S.mapShownC = mapShown; if (mapShown && !S.flight) caption(S.view === 'sat' ? 'THE REAL GROUND, FROM ABOVE' : 'THE REAL MAP'); S.attDirty = true; }
  }
  var SHORT = { 'SEE THROUGH THE UNIVERSE TO ONE SUBSTATION': 'SEE THROUGH TO ONE SUBSTATION', 'THE KUIPER: A STAR FOR EVERY LINE OF CODE': 'A STAR FOR EVERY LINE OF CODE' };
  function caption(t) {
    if (!S) return;
    if (S.phone) { t = SHORT[t] || t; if (/^ONE SUBSTATION: /.test(t)) t = 'ONE SUBSTATION'; if (/^DOWN TO /.test(t)) t = 'DOWN TO THE SUBSTATION'; }
    S.cap.textContent = t; S.cap.style.transition = 'none'; S.cap.style.opacity = '1';
    clearTimeout(S.capT); S.capT = setTimeout(function () { if (S) { S.cap.style.transition = 'opacity 1.6s'; S.cap.style.opacity = '0.35'; } }, 3500);
  }
  function attrib() {
    var t = [];
    if (S.D > 1.5) t.push(ATTR_SUBS);
    if (S.mapVis) { t.push(ATTR_MAP); if (S.view === 'sat') t.push(ATTR_SAT); }
    S.att.textContent = t.join(S.phone ? ' · ' : '\n');
    if (S.mapState === 'failed' && wantMap() && S.D > 1.5) {   // one plain line, big enough to read
      el('div', 'font:bold 24px/1.2 ' + FONT + ';color:rgba(255,176,0,0.9);margin-top:6px', S.mapWhy === 'webgl' ? 'THIS BROWSER CANNOT DRAW THE REAL MAP' : 'REAL MAP NEEDS THE INTERNET', S.att);
    }
    S.att.style.display = S.att.childNodes.length ? 'block' : 'none';
  }
  function readout(cam) {
    var s;
    if (S.D < 1) s = fmt(S.NP) + ' STARS  KUIPER';
    else { var lat = unmercLat(cam.y), mpp = 40075016.686 * Math.cos(lat * Math.PI / 180) / (S.D < 2 ? S.wsUK : cam.ws);
      s = 'ZOOM ' + (S.D < 2 ? S.zUK : cam.z).toFixed(1) + '  1 PX = ' + (mpp >= 1000 ? (mpp / 1000).toFixed(1) + ' KM' : (mpp >= 10 ? Math.round(mpp) : mpp.toFixed(1)) + ' M'); }
    if (s !== S.roS) { S.roS = s; S.ro.textContent = s; }
  }

  function showCard() {
    var i = S.T; if (i < 0) return;
    var key = keyOfSub(i), p = window.KuiperLaw.place(key), lat = D0.lat[i], lon = D0.lon[i];
    var c = S.card; c.innerHTML = '';
    function row(t, col, bold) { return el('div', 'color:' + (col || '#fff') + ';' + (bold ? 'font-weight:bold;' : ''), t, c); }
    var head = row(nameOf(i).toUpperCase(), C.amber, true);
    head.style.cursor = 'pointer'; head.title = 'more or less';
    var body = el('div', '', null, c);
    function brow(t, col) { return el('div', 'color:' + (col || '#fff'), t, body); }
    brow(voltText(i) + ', ' + opText(i), C.white);
    brow(Math.abs(lat).toFixed(5) + (lat >= 0 ? 'N ' : 'S ') + Math.abs(lon).toFixed(5) + (lon >= 0 ? 'E' : 'W'), C.sky);
    brow('STAR KEY ' + fmt(key), C.cyan);
    brow('BEARING ' + bearingOf(p).toFixed(1) + '°  RANGE ' + fmt(p.r), C.cyan);
    if (S.spiderOn && S.spider) {
      var sp = S.spider;
      brow(sp.kind === 'published' ? 'PUBLISHED CIRCUITS, NESO ETYS 2025' : 'NEAREST BY DISTANCE, NOT CONNECTIONS', C.amber);
      if (sp.caveat) brow(sp.caveat, 'rgba(255,255,255,0.6)');
      for (var k = 0; k < sp.arrows.length && k < 8; k++) brow((sp.arrows[k].name || '').toUpperCase() + '  ' + sp.arrows[k].label, '#ddd');
      if (sp.listed.length) brow('NO COORDINATES PUBLISHED: ' + sp.listed.slice(0, 12).join(', ').toUpperCase(), 'rgba(255,255,255,0.6)');
    }
    var links = el('div', 'margin-top:6px', null, body);
    function link(t, href, why) {
      var a = el('a', 'display:block;font:24px/1.35 ' + FONT + ';color:' + C.cyan + ';text-decoration:underline;text-underline-offset:4px;opacity:0.85', t + ' ↗', links);
      a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.title = why; return a;
    }
    link('OPEN IN GRIDATLAS', ATLAS_URL + '?latitude=' + lat.toFixed(5) + '&longitude=' + lon.toFixed(5) + '&zoom=15', 'GridAtlas reads latitude, longitude and zoom; it opens at this point with its own card');
    link('FLY IT IN THE SIMULATOR', SIM_URL + '?lat=' + lat.toFixed(6) + '&lon=' + lon.toFixed(6), 'the simulator overlay reads lat and lon (overlay.html:48-49)');
    brow('HELICOPTER, LIDAR: NEXT', 'rgba(255,255,255,0.45)');
    // WHY: the exact rule and the sources, for the engineer (one tap, closed by default)
    var why = el('div', 'margin-top:6px;color:' + C.cyan + ';cursor:pointer;text-decoration:underline;text-underline-offset:4px', S.whyOpen ? 'WHY -' : 'WHY +', body);
    why.addEventListener('click', function () { S.whyOpen = !S.whyOpen; showCard(); });
    if (S.whyOpen) {
      var w = el('div', 'color:rgba(255,255,255,0.8);font-size:24px', null, body);
      [
        'A star is a line of code, not a substation. The stars gather into the grid as a picture; the Kuiper does not address substations.',
        'STAR KEY = floor((j + 0.5) x ' + fmt(S.SPACE) + ' / 20,000) for substation j of the public file, the same rule as DRAW THE GRID. Its place is KuiperLaw.place(key): angle = (key x 2654435769 mod 2^32) / 2^32 turns, RANGE r = sqrt(key + 0.5). BEARING = 90 - angle in degrees, clockwise from up.',
        'Name, voltage, operator and position: OpenStreetMap (ODbL), as published at globalgrid2050.com/grid_substations.geojson. Map: CARTO dark matter. Satellite: Esri World Imagery. Both are the sources GridAtlas uses.',
        'Every layer uses one Web Mercator mapping (512 x 2^zoom pixels round the world), so the marker and the map agree to the pixel.'
      ].forEach(function (t) { el('div', 'margin-top:6px', t, w); });
    }
    var collapsed = S.phone && !S.cardOpen;
    body.style.display = collapsed ? 'none' : 'block';
    head.textContent = nameOf(i).toUpperCase() + (S.phone ? (collapsed ? '  +' : '  -') : '');
    head.addEventListener('click', function () { S.cardOpen = !S.cardOpen; showCard(); });
    c.style.display = 'block'; S.cardOn = true;
  }
  function hideCard() { if (S) { S.card.style.display = 'none'; S.cardOn = false; S.cardDirty = S.T >= 0; } }
  function arrive() {   // like the Pipeline News MAP arrival in GridAtlas: on the point, then the card, then the lines
    S.cardDirty = true; S.mN = 0; S.mTotal = 0; ping(12, 0.04); ping(19, 0.025);
    caption('ONE SUBSTATION: ' + nameOf(S.T).toUpperCase());
  }

  // ---------------- input ----------------
  function btn(label, parent, fn, title) {
    var b = el('button', 'pointer-events:auto;font:bold 24px ' + FONT + ';color:' + C.cyan + ';background:transparent;border:1px solid rgba(0,255,255,0.5);border-radius:8px;opacity:0.6;cursor:pointer;white-space:nowrap;letter-spacing:0.5px;transition:opacity .2s,background .2s;touch-action:manipulation', label, parent);
    b.type = 'button'; if (title) b.setAttribute('aria-label', title);
    b.addEventListener('pointerenter', function () { b.style.opacity = '1'; });
    b.addEventListener('pointerleave', function () { if (!b.dataset.on) b.style.opacity = '0.6'; });
    if (fn) b.addEventListener('click', function (e) { e.stopPropagation(); audio(); fn(); });
    S.allBtns.push(b);
    return b;
  }
  function lit(b, onv) { if (onv) { b.dataset.on = '1'; b.style.background = 'rgba(0,255,255,0.14)'; b.style.opacity = '1'; } else { delete b.dataset.on; b.style.background = 'transparent'; b.style.opacity = '0.6'; } }

  function pick(px, py) {
    var n = S.D < 2 ? S.NP : NSUB, best = -1, bd = (S.phone ? 34 : 28), bd2 = bd * bd, sx = S.sx, sy = S.sy;
    for (var i = 0; i < n; i++) { var dx = sx[i] - px, dy = sy[i] - py, d = dx * dx + dy * dy; if (d < bd2) { bd2 = d; best = i; } }
    if (best < 0) return false;
    var sub = S.pSub[best];
    if (S.D < 2) { flyTo(sub); S.flight.phase = 'down'; setTarget(sub, false); S.Dgoal = DMAX; caption('DOWN TO ' + nameOf(sub).toUpperCase()); }
    else { setTarget(sub, true); S.Dgoal = Math.max(S.Dgoal, Math.min(DMAX, S.D + 1.5)); ping(5, 0.03); caption(nameOf(sub).toUpperCase()); }
    return true;
  }

  function open(host) {
    if (S) close();
    if (!SUB || !window.KuiperLaw) { host.textContent = 'descent.js: data or KuiperLaw missing'; return; }
    S = { host: host, listeners: [], allBtns: [], D: 0, Dgoal: 0, speed: 2.4, hold: 0, T: -1, corrA: 0, corrX: 0, corrY: 0, cam: { x: 0, y: 0, z: 0, ws: 1 },
      view: 'map', viewTouched: false, mapState: 'none', mapVis: false, mapA: -1, camKey: '', subs: true, grid: false, spiderOn: false, hops: 1,
      scan: true, sw: Math.PI / 2, muted: false, stage: -1, roT: 0, roS: '', mIdx: new Int32Array(200), mN: 0, mTotal: 0, q: '',
      ft: new Float32Array(120), fi: 0, fiv: new Float32Array(240), fj: 0, lite: false, cardOn: false, cardDirty: false, cardOpen: false, mapShownC: 0, pointers: {} };
    S.SPACE = window.KuiperLaw.constants.SPACE;
    host.style.position = host.style.position || 'fixed'; host.style.overflow = 'hidden'; host.style.background = '#000';
    S.mapEl = el('div', 'position:absolute;inset:0;visibility:hidden;opacity:0;pointer-events:none;background:#000', null, host);
    var cv = el('canvas', 'position:absolute;left:0;top:0;touch-action:none;display:block', null, host);
    cv.setAttribute('aria-label', 'See through the universe to one substation');
    S.cv = cv; S.ctx = cv.getContext('2d');
    var ui = el('div', 'position:absolute;inset:0;pointer-events:none;font:24px ' + FONT + ';color:#fff', null, host); S.ui = ui;
    var pad = 'env(safe-area-inset-top)';
    S.cap = el('div', 'position:absolute;left:16px;top:calc(16px + ' + pad + ');font:bold 26px/1.15 ' + FONT + ';color:#fff;max-height:62px;overflow:hidden', '', ui);
    S.ro = el('div', 'position:absolute;left:16px;font:24px ' + FONT + ';color:rgba(0,255,255,0.7);white-space:nowrap', '', ui);
    S.att = el('div', 'position:absolute;font:16px/1.3 ' + FONT + ';color:rgba(160,210,255,0.85);display:none;text-shadow:0 0 3px #000;white-space:pre-line', '', ui);
    S.card = el('div', 'position:absolute;background:rgba(0,0,0,0.8);border:1px solid rgba(255,176,0,0.55);border-radius:10px;padding:8px 12px;font:24px/1.3 ' + FONT + ';display:none;pointer-events:auto;overflow:auto;box-sizing:border-box', '', ui);
    S.card.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    // the search box: GridAtlas position and style (dark box, cyan outline GO)
    S.search = el('div', 'position:absolute;display:flex;gap:8px;pointer-events:auto', null, ui);
    S.input = el('input', 'flex:1;min-width:0;box-sizing:border-box;background:rgba(0,0,0,0.85);color:#fff;border:1px solid rgba(0,255,255,0.35);border-radius:6px;padding:0 12px;font:24px ' + FONT + ';outline:none', null, S.search);
    S.input.type = 'text'; S.input.placeholder = 'Substation name'; S.input.maxLength = 80; S.input.autocomplete = 'off'; S.input.spellcheck = false;
    S.input.setAttribute('aria-label', 'Substation name');
    S.input.addEventListener('input', function () { audio(); doSearch(); });
    S.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); goSearch(); }
      else if (e.key === 'Escape') { e.preventDefault(); S.input.blur(); }
      e.stopPropagation();
    });
    S.input.addEventListener('focus', function () { S.input.style.borderColor = 'rgba(0,255,255,0.8)'; });
    S.input.addEventListener('blur', function () { S.input.style.borderColor = 'rgba(0,255,255,0.35)'; });
    S.goB = btn('GO', S.search, goSearch, 'go to this substation');
    S.goB.style.cssText += ';border-color:rgba(0,255,255,0.8);opacity:0.85';
    S.note = el('div', 'position:absolute;font:24px/1.2 ' + FONT + ';color:rgba(255,176,0,0.9);text-shadow:0 0 4px #000', '', ui);
    // top right: X and mute
    S.xbtn = btn('X', ui, function () { M.close(); }, 'close');
    S.xbtn.style.cssText += ';position:absolute;right:calc(8px + env(safe-area-inset-right));top:calc(8px + ' + pad + ');font-size:34px;padding:0;opacity:0.7';
    S.mute = btn('♪', ui, function () { S.muted = !S.muted; S.mute.textContent = S.muted ? '♪ OFF' : '♪'; if (S.og) S.og.gain.value = 0; }, 'mute');
    S.mute.style.position = 'absolute';
    // bottom-left: GRID SUBS SPIDER, lit when on (GridAtlas mobile chips)
    S.grpBL = el('div', 'position:absolute;display:flex;gap:6px;pointer-events:none', null, ui);
    S.gridB = btn('GRID', S.grpBL, function () { S.grid = !S.grid; lit(S.gridB, S.grid); if (S.map && S.mapState === 'ready') GA_LINES.forEach(function (L) { try { S.map.setLayoutProperty('ga' + L[0], 'visibility', S.grid ? 'visible' : 'none'); } catch (e) {} }); caption(S.grid ? '400 kV AND 132 kV LINES, OPENSTREETMAP' : 'LINES OFF'); S.attDirty = true; }, 'grid lines');
    S.subsB = btn('SUBS', S.grpBL, function () { S.subs = !S.subs; lit(S.subsB, S.subs); caption(S.subs ? 'EVERY SUBSTATION' : 'SUBSTATIONS OFF'); }, 'substations');
    S.spB = btn('SPIDER', S.grpBL, function () { S.spiderOn = !S.spiderOn; lit(S.spB, S.spiderOn); S.spider = null; S.spiderT0 = performance.now(); if (!S.spiderOn) caption('SPIDER OFF'); else if (S.T < 0 || S.D < 2.4) caption('CHOOSE A SUBSTATION FIRST'); S.cardDirty = true; }, 'spider arrows');
    lit(S.subsB, true);
    // view switch
    S.grpView = el('div', 'position:absolute;display:flex;gap:6px;pointer-events:none', null, ui);
    S.viewBtns = [['kuiper', 'KUIPER'], ['map', 'MAP'], ['sat', 'SATELLITE']].map(function (v) {
      var b = btn(v[1], S.grpView, function () { setView(v[0], true); }, v[1].toLowerCase() + ' view'); b.dataset.v = v[0]; return b;
    });
    S.satB = S.viewBtns[2]; lit(S.viewBtns[1], true);
    // DESCEND / ASCEND: hold to keep moving, tap for one step
    S.grpUD = el('div', 'position:absolute;display:flex;gap:6px;pointer-events:none', null, ui);
    function holdBtn(label, dir, title) {
      var b = btn(label, S.grpUD, null, title), t0 = 0;
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); audio(); S.flight = null; S.hold = dir; t0 = performance.now(); try { b.setPointerCapture(e.pointerId); } catch (x) {} });
      var stop = function () { if (S && S.hold === dir) { S.hold = 0; if (performance.now() - t0 < 220) S.Dgoal = clamp(S.Dgoal + dir * 0.6, 0, DMAX); } };
      b.addEventListener('pointerup', stop); b.addEventListener('pointercancel', stop); b.addEventListener('lostpointercapture', stop);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.Dgoal = clamp(S.Dgoal + dir * 0.6, 0, DMAX); } });
      return b;
    }
    S.upB = holdBtn('▲', -1, 'ascend'); S.dnB = holdBtn('▼', 1, 'descend');
    S.upB.dataset.cmd = 'ascend'; S.dnB.dataset.cmd = 'descend';

    // particles: the DRAW THE GRID keys; particle j < 5800 lands on substation j, the rest gather around substations
    // Desktop: all 20,000 DRAW THE GRID keys, particle p carries key index p. Phone: the first 5,800 the same, then every
    // second key of the rest (12,900 stars). Particle p goes to substation p mod 5,800, so substation j always gets the star
    // with key index j: its STAR KEY is grid.js keyOf(j) on every device.
    var L = window.KuiperLaw, phoneNow = Math.min(host.clientWidth || innerWidth, host.clientHeight || innerHeight) < 600;
    var n = phoneNow ? NSUB + Math.ceil((NRULE - NSUB) / 2) : NRULE; S.NP = n;
    S.kx = new Float32Array(n); S.ky = new Float32Array(n); S.delay = new Float32Array(n); S.pSub = new Int32Array(n);
    S.ox = new Float32Array(n); S.oy = new Float32Array(n); S.sx = new Float32Array(n); S.sy = new Float32Array(n);
    S.subKey = new Float64Array(NSUB);
    S.starCv = document.createElement('canvas'); S.starCtx = S.starCv.getContext('2d'); S.starKey = ''; S.layoutN = 0;
    S.bCnt = new Int32Array(360); S.bStart = new Int32Array(361); S.bItem = new Int32Array(n); S.bOf = new Int16Array(n); S.bucketsOK = false;
    var Rw = Math.sqrt(S.SPACE + 0.5);
    for (var p = 0; p < n; p++) {
      var ki = (phoneNow && p >= NSUB) ? NSUB + 2 * (p - NSUB) : p, key = Math.floor((ki + 0.5) * S.SPACE / NRULE), pl = L.place(key);
      S.kx[p] = pl.x; S.ky[p] = pl.y; S.delay[p] = 0.3 * pl.r / Rw;
      var c = Math.floor(p / NSUB); S.pSub[p] = p % NSUB; if (c === 0) S.subKey[p] = key;
      var th = c * GA, rr = 2.2 * Math.sqrt(c); S.ox[p] = rr * Math.cos(th); S.oy[p] = rr * Math.sin(th);
    }

    // canvas input: tap picks, wheel and pinch descend, a drag grabs the sweep arm
    on(cv, 'pointerdown', function (e) {
      audio(); S.pointers[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
      var ids = Object.keys(S.pointers);
      if (ids.length === 2) { var a = S.pointers[ids[0]], b = S.pointers[ids[1]]; S.pinch = Math.hypot(a.x - b.x, a.y - b.y) || 1; S.flight = null; }
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    });
    on(cv, 'pointermove', function (e) {
      var pp = S.pointers[e.pointerId]; if (!pp) return; pp.x = e.clientX; pp.y = e.clientY;
      var ids = Object.keys(S.pointers);
      if (ids.length === 2 && S.pinch) {
        var a = S.pointers[ids[0]], b = S.pointers[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        S.Dgoal = clamp(S.Dgoal + Math.log(d / S.pinch) / Math.LN2 * 0.9, 0, DMAX); S.pinch = d;
      } else if (ids.length === 1 && Math.hypot(pp.x - pp.x0, pp.y - pp.y0) > 12) {
        var r = cv.getBoundingClientRect(); S.grab = true; S.sw = -Math.atan2(pp.y - r.top - S.cy, pp.x - r.left - S.cx);
      }
    });
    function up(e) {
      var pp = S.pointers[e.pointerId]; delete S.pointers[e.pointerId];
      if (Object.keys(S.pointers).length < 2) S.pinch = 0;
      if (!pp) return;
      if (!S.grab && Math.hypot(pp.x - pp.x0, pp.y - pp.y0) < 12 && e.type === 'pointerup') {
        var r = cv.getBoundingClientRect(); pick(e.clientX - r.left, e.clientY - r.top);
      }
      if (!Object.keys(S.pointers).length) { if (S.grab) { S.sw = (S.sw + 2 * Math.PI) % (2 * Math.PI); } S.grab = false; }
    }
    on(cv, 'pointerup', up); on(cv, 'pointercancel', up);
    on(cv, 'wheel', function (e) {
      e.preventDefault(); audio(); S.flight = null;
      var dy = +e.deltaY || 0; if (e.deltaMode === 1) dy *= 30; else if (e.deltaMode === 2) dy *= 600;
      if (!isFinite(dy)) return;
      S.Dgoal = clamp(S.Dgoal + clamp(dy * 0.0025, -0.8, 0.8), 0, DMAX);
    }, { passive: false });
    on(window, 'keydown', function (e) {
      var tg = e.target && e.target.tagName;
      if (e.key === 'Escape') {
        if (tg === 'INPUT' || tg === 'TEXTAREA') { e.target.blur(); return; }
        M.close(); return;
      }
      if (tg === 'INPUT' || tg === 'TEXTAREA') return;
      var k = e.key;
      if (k === 'ArrowDown' || k === 'PageDown' || k === '+' || k === '=') { e.preventDefault(); audio(); S.flight = null; S.Dgoal = clamp(S.Dgoal + 0.5, 0, DMAX); }
      else if (k === 'ArrowUp' || k === 'PageUp' || k === '-' || k === '_') { e.preventDefault(); audio(); S.flight = null; S.Dgoal = clamp(S.Dgoal - 0.5, 0, DMAX); }
      else if (k === 'Home') { S.flight = null; S.Dgoal = 0; }
      else if (k === 'End') { S.flight = null; S.Dgoal = DMAX; }
      else if (k === '1') setView('kuiper', true); else if (k === '2') setView('map', true); else if (k === '3') setView('sat', true);
      else if (k === '/' ) { e.preventDefault(); S.input.focus(); }
    });
    on(window, 'resize', function () { if (S) layout(); });
    on(window, 'orientationchange', function () { setTimeout(function () { if (S) layout(); }, 200); });
    on(document, 'visibilitychange', function () {
      if (!S) return;
      if (document.hidden) { cancelAnimationFrame(S.raf); S.raf = 0; if (S.og) S.og.gain.value = 0; }
      else if (!S.raf) { S.last = 0; S.raf = requestAnimationFrame(frame); }
    });

    decode();
    layout();
    caption('SEE THROUGH THE UNIVERSE TO ONE SUBSTATION');
    S.stage = 0;
    S.raf = requestAnimationFrame(frame);
    // fetch the map library while the player is still among the stars, so its first parse does not stall the fall
    S.preT = setTimeout(function () { if (S && wantMap()) loadMap(); }, 1500);

    window.__descent = {
      state: function () { return S && { D: S.D, Dgoal: S.Dgoal, T: S.T, name: S.T >= 0 ? nameOf(S.T) : '', view: S.view, mapState: S.mapState, mapVis: S.mapVis,
        tileOK: S.tileOK || 0, tileErr: S.tileErr || 0, z: S.cam.z, W: S.W, H: S.H, Rpx: S.Rpx, NP: S.NP, cap: S.cap.textContent, note: S.note.textContent,
        mN: S.mN, mTotal: S.mTotal, card: S.cardOn ? S.card.textContent : '', att: S.att.textContent, flight: S.flight && S.flight.phase,
        spider: S.spider && { kind: S.spider.kind, n: S.spider.arrows.length, labels: S.spider.arrows.map(function (a) { return a.name + ' ' + a.label; }) }, lite: S.lite, grid: S.grid, subs: S.subs }; },
      frameTimes: function () { return Array.prototype.slice.call(S.ft); },
      frameIntervals: function () { return Array.prototype.slice.call(S.fiv, 0, Math.min(S.fj, S.fiv.length)); },
      setD: function (d) { S.flight = null; S.Dgoal = clamp(+d || 0, 0, DMAX); },
      jumpD: function (d) { S.flight = null; S.D = S.Dgoal = clamp(+d || 0, 0, DMAX); },
      target: function (i) { setTarget(i, false); },
      fly: function (i) { flyTo(i); },
      find: function (name) { var q = String(name).toLowerCase(); for (var i = 0; i < D0.n; i++) if (D0.low[i] === q) return i; return -1; },
      sub: function (i) { return { name: D0.names[i], lat: D0.lat[i], lon: D0.lon[i], volt: voltText(i), op: opText(i) }; },
      screenOf: function (i) { return [S.sx[i], S.sy[i]]; },
      mapPointOf: function (i) { if (!S.map) return null; var p = S.map.project([D0.lon[i], D0.lat[i]]); return [p.x, p.y]; },
      mapReady: function () { return !!(S.map && S.mapState === 'ready' && S.map.loaded() && S.map.areTilesLoaded()); }
    };
    ensureGridData(function () {
      if (!S) return;
      var names = window.KGGridData && window.KGGridData.substations && window.KGGridData.substations.names;
      if (names) for (var q = 0; q < D0.n; q++) { D0.names[q] = names[q] || ''; D0.low[q] = D0.names[q].toLowerCase(); }
      else caption('grid-data.js did not load: names and lines are missing');
    });
  }

  function close() {
    if (!S) return;
    cancelAnimationFrame(S.raf); clearTimeout(S.capT); clearTimeout(S.libTimer); clearTimeout(S.preT);
    S.listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    if (S.map) { try { S.map.remove(); } catch (e) {} }
    if (S.ac) { try { S.osc.stop(); S.ac.close(); } catch (e) {} }
    var h = S.host; S = null;
    while (h.firstChild) h.removeChild(h.firstChild);
    window.__descent = null;
  }

  var M = { id: 'descent', label: 'SEE THROUGH', sentence: 'See through the universe to one substation', open: open, close: close };
  (window.KGModules = window.KGModules || []).push(M);
})();
