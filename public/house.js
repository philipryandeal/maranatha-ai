const observatoryGrid=document.querySelector('#tracking-grid');
const apothecaryGrid=document.querySelector('#apothecary-grid');
const gardenGrid=document.querySelector('#garden-grid');
const instrumentTitle=document.querySelector('#instrument-title');
const instrumentStatus=document.querySelector('#instrument-status');
const instrumentData=document.querySelector('#instrument-data');

function slot(code,title,copy,status){
  const node=document.createElement('article');
  node.className='empty-slot';
  node.innerHTML='<span class="slot-code">'+code+'</span><div><h3>'+title+'</h3><p>'+copy+'</p></div><span class="slot-status">'+status+'</span>';
  return node;
}

async function loadObservatory(){
  const response=await fetch('/data/observatory.json',{cache:'no-store'});
  if(!response.ok) throw new Error('Observatory unavailable');
  const data=await response.json();

  instrumentTitle.textContent=data.instrument;
  instrumentStatus.textContent=data.ayanamsa.name;
  instrumentData.innerHTML=
    '<div><dt>Ayanamsa</dt><dd>'+data.ayanamsa.name+'</dd></div>'+
    '<div><dt>Engine</dt><dd>'+data.ayanamsa.calculation_engine+'</dd></div>'+
    '<div><dt>Content</dt><dd>'+data.ayanamsa.content_authority+'</dd></div>'+
    '<div><dt>Status</dt><dd>'+data.ayanamsa.status+'</dd></div>';

  data.tracked_layers.forEach((item,index)=>{
    const card=document.createElement('div');
    card.className='tracking-card';
    card.innerHTML='<span>Track '+String(index+1).padStart(2,'0')+'</span><strong>'+item.label+'</strong><span>'+item.status+'</span>';
    observatoryGrid.appendChild(card);
  });
}

async function loadApothecary(){
  const response=await fetch('/data/apothecary.json',{cache:'no-store'});
  if(!response.ok) throw new Error('Apothecary unavailable');
  const data=await response.json();

  if(data.collections.length===0){
    apothecaryGrid.append(
      slot('SHELF 01','Materia','Plant and root records, names, provenance, and house notes.','Awaiting Eiko'),
      slot('SHELF 02','Herbal Astrology','Planetary, stellar, seasonal, or other correspondences chosen by the house.','Awaiting Eiko'),
      slot('SHELF 03','Preparations','Forms of preparation and ritual handling selected by the house.','Awaiting Eiko'),
      slot('SHELF 04','Cautions','Safety, contraindications, sourcing concerns, and boundaries.','Awaiting Eiko')
    );
  }
}

async function loadGarden(){
  const response=await fetch('/data/garden.json',{cache:'no-store'});
  if(!response.ok) throw new Error('Garden unavailable');
  const data=await response.json();

  if(data.beds.length===0){
    gardenGrid.append(
      slot('BED 01','Planting Bed','Reserved for living plant records and what is currently being tended.','Unplanted'),
      slot('BED 02','Seasonal Bed','Reserved for seasonal cycles, germination, flowering, harvest, and rest.','Unplanted'),
      slot('BED 03','Relationship Bed','Reserved for dated tending notes and the evolving relationship with a plant.','Unplanted'),
      slot('BED 04','Seed Archive','Reserved for seed lineage, source, storage, propagation, and future planting.','Unplanted')
    );
  }
}

Promise.all([loadObservatory(),loadApothecary(),loadGarden()]).catch(error=>{
  console.error(error);
  instrumentStatus.textContent='House data unavailable';
});
