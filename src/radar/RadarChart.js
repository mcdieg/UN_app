import React from 'react';
import "./RadarChart.css"
 
import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css'

 
class Radar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: []
    };
  }
  
  render() {
    let GHG = this.props.data.data.slice(-1)[0].GHG; 
    let Acidication = this.props.data.data.slice(-1)[0].Acid; 
    let Eutrophication = this.props.data.data.slice(-1)[0].Eutr; 
    let landUse = this.props.data.data.slice(-1)[0].Land_use
    let Freshwater = this.props.data.data.slice(-1)[0].Freshwater
    const ghgFactor = 10
    const freshwaterFactor = 100
    const acidificationFactor = 100 
    const eutrophicationFactor = 100
    const landUseFactor = 10

    Freshwater = Freshwater / freshwaterFactor
    landUse = landUse * landUseFactor
    GHG = GHG * ghgFactor
    Acidication = Acidication * acidificationFactor
    Eutrophication = Eutrophication * eutrophicationFactor

    const data = [
      {
        data:  {
          Land_use: landUse,
          GHG: GHG,
          Acid: Acidication,
          Eutr: Eutrophication,
          Freshwater: Freshwater
        }
        ,
        meta: { color: 'blue' }
      }
    ];
 
    const captions = {
      Land_use: 'Land Use',
      GHG: 'Greenhouse Gases',
      Acid: 'Acidification',
      Eutr: 'Eutrophication',
      Freshwater: 'Freshwater Use'
    };

    return (
      <div className="RadarChart">  
        <RadarChart
            captions={captions}
            data={data}
            size={500}
          />
        </div>
    );
  }
}
 
export default Radar;