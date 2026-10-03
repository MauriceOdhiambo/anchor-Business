type Props={eyebrow:string;title:string;text?:string;center?:boolean};
export function SectionTitle({eyebrow,title,text,center}:Props){return <div className="section-title" style={center?{marginInline:'auto',textAlign:'center'}:undefined}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text&&<p>{text}</p>}</div>}
