import React from 'react';
import ReactTable from 'react-table'
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'

class VariablesEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { editingConnId: null };
    this.connections = this.compute();
    this.renderEditable = this.renderEditable.bind(this);
    this.renderReadonly = this.renderReadonly.bind(this);
    this.renderCheckButton = this.renderCheckButton.bind(this);
  }

  compute() {
      let edges = this.props.edges;
      let filter = this.props.filter;
      let nodeSelected = filter.fr && (filter.fr === filter.to);
      
      if (filter.fr && filter.to) {
        let nodeFrom = this._findNode(filter.fr);
        let nodeTo = this._findNode(filter.to);
        if (nodeSelected) { // node selected
          nodeSelected = nodeFrom;
          edges = edges.filter((edge) => {
            return edge.from === nodeFrom.id || edge.to === nodeTo.id;
          });
        } else {
          edges = edges.filter((edge) => { // edge selected
            return edge.from === nodeFrom.id && edge.to === nodeTo.id;
          });
        }
      }

      let hconns = {};
      edges.forEach((edge) => {
        let vars = edge.name.split(",");
        let fromName = this._findNode(edge.from).name;
        let toName = this._findNode(edge.to).name;
        vars.forEach((v, i) => {
          let id = edge.from + '_' + v;
          if (hconns[id]) {
            hconns[id].to.push(edge.to);
            hconns[id].toName.push(toName);
          } else {
            hconns[id] = {
                id: id,
                fr: edge.from,
                to: [edge.to],
                frName: fromName,
                toName: [toName], 
                varname: v,
                connId: edge.conn_ids[i]
            }
          }
        }, this);
      }, this);
      
      let conns = [];
      for (let id in hconns) {
        conns.push(hconns[id]);
      }
      conns.sort((a, b) => this._connectionCompare(nodeSelected, a, b));
      
      let connections = conns.map((conn) => {
          let infos = this._findInfos(conn); 
          let badge, highlightFr, highlightTo = {};
          
          if (nodeSelected) {
            let badgeType = "badge "; 
            let ioType = "in"; 
            if (nodeSelected.id===conn.fr) {
              highlightFr = {'fontWeight': 'bold'};  
              badgeType += "badge-secondary";
              ioType = "out";
            } else { 
              highlightTo = {'fontWeight': 'bold'};  
              badgeType += "badge-primary";
            }
          }
          let val = { id: conn.connId, from: conn.frName, to: conn.toName.join(', '), name: infos.vName, desc: infos.desc,
                      type: infos.type, shape: infos.shape, units: infos.units, init: infos.init, lower: infos.lower, 
                      upper: infos.upper, active: infos.active, role: infos.role, fromId: conn.fr, toIds: conn.to };
          return val;
          
      });
        
      return connections;
  }
  
  componentDidMount() {
    $(".table-tooltip").attr("data-toggle", "tooltip")
    $(() => { $('.table-tooltip').tooltip({placement: 'right'}); });  
  }
  
  componentWillUnmount() {
    $('.table-tooltip').tooltip('dispose');
  }

  componentWillUpdate() {
    this.componentWillUnmount();
  }
  
  componentDidUpdate() {
    this.componentDidMount();
  }
  
  render() {  
    this.connections = this.compute();  
    let columns = [
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'From'),
                     accessor: "from",
                     Cell: (cellInfo) => this.renderReadonly(cellInfo),
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'To'),
                     accessor: "to",
                     minWidth: 200,
                     Cell: (cellInfo) => this.renderReadonly(cellInfo),
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Name'),
                     accessor: "name", 
                     minWidth: 200, 
                     Cell: this.renderEditable 
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Role'),
                     accessor: "role",  
                     Cell: (cellInfo) => this.renderEditable(cellInfo, this._computeRoleSelection(this.connections[cellInfo.index]))
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Type'),
                     accessor: "type", 
                     Cell: (cellInfo) => this.renderEditable(cellInfo, this._computeTypeSelection(this.connections[cellInfo.index])) 
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Shape'),
                     accessor: "shape", 
                     Cell: this.renderEditable
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Units'),
                     accessor: "units", 
                     Cell: this.renderEditable
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Init'),
                     accessor: "init", 
                     Cell: this.renderEditable
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Lower'),
                     accessor: "lower", 
                     Cell: this.renderEditable
                   },
                   {
                     Header: (cellInfo) => this.renderHeader(cellInfo, 'Upper'),
                     accessor: "upper", 
                     Cell: this.renderEditable
                   },
                 ];
    if (this.props.isEditing) {
      columns.splice(0, 0, {
        Header: (cellInfo) => this.renderHeader(cellInfo, '#'),
        accessor: "active",
        maxWidth: 25,
        Cell: this.renderCheckButton 
      });
      columns.splice(5, 0, {
        Header: (cellInfo) => this.renderHeader(cellInfo, 'Description'),
        accessor: "desc", 
        Cell: this.renderEditable 
      });
    }
    return (
            <div className="mt-3"> 
              <ReactTable
                data={this.connections}
                columns={columns}
                className="-striped -highlight"
                showPagination={false}
                pageSize={this.connections.length}
              />
            </div>
          );   
  };

  renderHeader(cellInfo, title) {
    return (<strong>{title}</strong>);  
  }
  
  renderCheckButton(cellInfo) {
    let isChecked = this.connections[cellInfo.index].active;
//    console.log(this.connections[cellInfo.index]);
    return (<input type="checkbox" value="true" checked={isChecked}
            onChange={() => this.props.onConnectionChange(this.connections[cellInfo.index].id, {active: !isChecked})}/>);  
  }
  
  renderEditable(cellInfo, selectOptions) {
    console.log(this.connections[cellInfo.index]);
    if (this.props.isEditing && this.connections[cellInfo.index].active) {
      if (selectOptions) {
        let id = this.connections[cellInfo.index][cellInfo.column.id];
        let selected = selectOptions.filter(choice => choice.id === id);
        return ( <RIESelect
          value={{id: id, text: selected[0].text }}
          change={ (attr) => {
            let change = {};
            change[cellInfo.column.id] = attr[cellInfo.column.id].id;
            this.props.onConnectionChange(this.connections[cellInfo.index].id, change)
          } }
          propName={cellInfo.column.id} 
          shouldBlockWhileLoading 
          options={selectOptions}/> );
      } else {
        return ( <RIEInput
          value={this.connections[cellInfo.index][cellInfo.column.id]}
          change={(attr) => this.props.onConnectionChange(this.connections[cellInfo.index].id, attr)}
          propName={cellInfo.column.id} 
          shouldBlockWhileLoading /> );
      }
    } else {  		
      return this.renderReadonly(cellInfo);
    }
  };
  
  renderReadonly(cellInfo) {
    let textStyle = this.connections[cellInfo.index].active?"":"text-inactive";
    if (cellInfo.column.id==='name') {
      let title = this.connections[cellInfo.index]['desc']; 
      textStyle += " table-tooltip";
      return (<span className={textStyle} title={title}>{this.connections[cellInfo.index][cellInfo.column.id]}</span>);
    } else {
      return (<span className={textStyle}>{this.connections[cellInfo.index][cellInfo.column.id]}</span>);
    }      
  }
  
  _computeTypeSelection(conn) {
    console.log(conn);
    let driver = this.props.nodes[0].id;
    let options = [{id:'Float', text: 'Float'},
                   {id:'Integer', text: 'Integer'},
                   {id:'String', text: 'String'}];
    if (driver !== conn.fromId) {
      options.splice(2, 1);  // suppress String, String only as parameter
    }
    return options;
  }

  _computeRoleSelection(conn) {
    let driver = this.props.nodes[0].id;
    let options = [{id:'parameter', text: 'Parameter'},
                   {id:'design_var', text: 'Design Var.'},
                   {id:'response', text: 'Response'},
                   {id:'objective', text: 'Objective'},
                   {id:'ineq_constraint', text: 'Ineq. Constraint'},
                   {id:'eq_constraint', text: 'Eq. Constraint'},
                   {id:'plain', text: 'Coupling'}];
    if (driver === conn.fromId) {
      options.splice(2, 5); 
      if (conn.type === "String") {
        options.splice(options.length-1, 1);
      }
    } else if (conn.toIds.includes(driver)) {
      options.splice(options.length-1, 1);
      options.splice(0, 2);
    }
    return options;
  }
  
  _findNode(id) { 
    for (var i=0; i < this.props.nodes.length; i++) {
      let node = this.props.nodes[i];
      if (node.id === id) {
        return (i==0)?{id: id, name: "Driver"}:{id: node.id, name: node.name};
      }
    };
    throw Error("Node id ("+ id +") unknown: " + JSON.stringify(this.props.nodes));  
  };
  
  _connectionCompare(nodeSelected, conna, connb) {
    let ret;
    if (nodeSelected) {
      if (conna.fr === nodeSelected.id) {
        if (connb.fr === nodeSelected.id) {  
          ret = conna.varname.localeCompare(connb.varname); 
        } else {
          ret = 1;  
        }
      } else {
        if (connb.fr === nodeSelected.id) {  
          ret = -1;
        } else { 
          ret = conna.varname.localeCompare(connb.varname);  
        }
      }
    } else {
      ret = conna.varname.localeCompare(connb.varname);  
    }
    return ret;  
  }
  
  _findInfos(conn) { 
      let vfr = this._findVariableInfo(conn.fr, conn.varname, "out");
      //let vto = this._findVariableInfo(conn.to[0], conn.varname, "in");
      let desc = vfr.desc; 
      let vartype = vfr.type;
      let shape = vfr.shape;    
      let varname = vfr.name 
      let units = vfr.units 
      let init = "";
      let lower = "";
      let upper = "";
      let active = vfr.active;
      let role = vfr.role
      
      if (vfr.parameter) { 
        init = vfr.parameter.init;
        lower = vfr.parameter.lower;
        upper = vfr.parameter.upper;
      }
      let infos = { id: conn.connId, idfrName: conn.frName, frUnits: vfr.units, 
                    vName: varname, desc: desc,
                    toName: conn.toName.join(', '),
                    type: vartype, shape: shape, init: init, lower: lower, upper:upper, 
                    units: units, active: active, role: role};
      // console.log(JSON.stringify(infos));
      return infos;
    }
      
    _findVariableInfo(disc, vname, io_mode) {
      let vars = this.props.vars;
      let vinfo = {units: '', desc: '', type: '', shape: '', init: '', lower: '', upper: '', active: true, role: ''};
      let vinfos = vars[disc][io_mode].filter((v) => { 
        return v.name === vname; 
      });
      if (vinfos.length === 1) {
        vinfo = vinfos[0];
      } else if (vinfos.length > 1) {
        console.log("Find several occurences of " + vname + "("+io_mode +"): " + JSON.stringify(vinfos));
        console.log("Check against fullnames");
        vinfos = vars[disc][io_mode].filter((v) => { 
          return v.fullname === vname; 
        });
        if (vinfos.length === 1) {
          vinfo = vinfos[0];
        } else {
          throw Error(`Expected one variable ${vname} found ${vinfos.length} in ${JSON.stringify(vars[disc][io_mode])}`);
        }
      } else {
        // console.log("Find no occurence of " + vname + "(" + io_mode + "): " + JSON.stringify(vinfos));
        // console.log("Check against fullnames");
        vinfos = vars[disc][io_mode].filter((v) => { 
          return v.fullname === vname; 
        });
        if (vinfos.length === 1) {
          vinfo = vinfos[0];
        } else {
          throw Error(`Expected one variable ${vname} found ${vinfos.length} in ${JSON.stringify(vars[disc][io_mode])}`);
        }
      }
      return vinfo;
    }

}

export default VariablesEditor;