import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import seedrandom from 'seedrandom';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rngSeed: 'seed for random number generation',
            showControlPoints: false,
            width: 297,
            height: 210,
            pieces: 100,
            mode: 'puzzle',
        };
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm">
                        {this.state.mode === 'puzzle' && (
                            <div>
                                <Puzzle
                                    rngSeed={this.state.rngSeed}
                                    showControlPoints={this.state.showControlPoints}
                                    width={this.state.width}
                                    height={this.state.height}
                                    pieces={this.state.pieces}
                                />
                                <Button onClick={() => generateSvgText(this.state)}>Download SVG</Button>
                            </div>
                        )}
                        {this.state.mode === 'algorithm' && <Algorithm rngSeed={this.state.rngSeed} showControlPoints={this.state.showControlPoints} />}
                    </div>
                    <div className="col-sm">
                        <Form>
                            <FormGroup>
                                <Label for="rngSeed">RNG seed</Label>
                                <Input
                                    type="text"
                                    name="rngSeed"
                                    id="rngSeed"
                                    value={this.state.rngSeed}
                                    onChange={e => {
                                        this.setState({ rngSeed: e.target.value });
                                    }}
                                />
                            </FormGroup>
                            <FormGroup tag="fieldset">
                                <legend>Mode</legend>
                                <FormGroup check>
                                    <Label check>
                                        <Input
                                            type="radio"
                                            name="radio_puzzle"
                                            checked={this.state.mode === 'puzzle'}
                                            onChange={() => {
                                                this.setState({ mode: 'puzzle', showControlPoints: false });
                                            }}
                                        />{' '}
                                        Puzzle generation
                                    </Label>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input
                                            type="radio"
                                            name="radio_tuning"
                                            checked={this.state.mode === 'algorithm'}
                                            onChange={() => {
                                                this.setState({ mode: 'algorithm' });
                                            }}
                                        />{' '}
                                        Algorithm tuning
                                    </Label>
                                </FormGroup>
                            </FormGroup>
                            {this.state.mode === 'puzzle' && (
                                <div>
                                    <FormGroup>
                                        <Label for="width">Size (mm)</Label>
                                        <Input
                                            type="text"
                                            name="width"
                                            id="width"
                                            value={this.state.width}
                                            onChange={e => {
                                                this.setState({ width: parseInt(e.target.value) });
                                            }}
                                        />
                                        <Input
                                            type="text"
                                            name="height"
                                            id="height"
                                            value={this.state.height}
                                            onChange={e => {
                                                this.setState({ height: parseInt(e.target.value) });
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="pieces">Pieces</Label>
                                        <Input
                                            type="text"
                                            name="pieces"
                                            id="pieces"
                                            value={this.state.pieces}
                                            onChange={e => {
                                                this.setState({ pieces: parseInt(e.target.value) });
                                            }}
                                        />
                                    </FormGroup>
                                </div>
                            )}
                            {this.state.mode === 'algorithm' && (
                                <FormGroup check>
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            checked={this.state.showControlPoints}
                                            onChange={() => {
                                                this.setState({ showControlPoints: !this.state.showControlPoints });
                                            }}
                                        />{' '}
                                        Show control points
                                    </Label>
                                </FormGroup>
                            )}
                            <Button>Submit</Button>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

class Puzzle extends Component {
    render() {
        let model_width = this.props.width;
        let model_height = this.props.height;
        if (model_width === 0 || model_height === 0) {
            return null;
        }

        // Calculate screen transformation
        let screen_width = 500;
        let screen_height = (500 / model_width) * model_height;
        let screenTransform = ScreenTransform(model_height, screen_height);

        // Compute curves
        let blockMetrics = calculateBlockMetrics(model_width, model_height, this.props.pieces);
        let curves = Array.from(iteratePuzzleCurves(blockMetrics, this.props.rngSeed));

        return (
            <div>
                <svg width={screen_width} height={screen_height} style={{ border: '0' }}>
                    {curves.map((curve, idx) => curve.toSvg(idx, screenTransform, this.props.showControlPoints))}
                </svg>
                {blockMetrics.numRows} x {blockMetrics.numCols} = {blockMetrics.actualNumPieces} pieces
            </div>
        );
    }
}

class Algorithm extends Component {
    render() {
        // Calculate screen transformation
        let screen_width = 500;
        let screen_height = 500;
        let screenTransform = ScreenTransform(1, 500);

        // Compute curves
        let rng = seedrandom(this.props.rngSeed);
        let curves = Array.from(iter_bezier_curves(rng));

        return (
            <svg width={screen_width} height={screen_height} style={{ border: '1px solid black' }}>
                {curves.map((curve, idx) => curve.toSvg(idx, screenTransform, this.props.showControlPoints))}
            </svg>
        );
    }
}

// Copied from an SVG generated with Adobe Illustrator
const SVG_HEADER = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
`;

function generateSvgText({ width, height, pieces, rngSeed }) {
    let blockMetrics = calculateBlockMetrics(width, height, pieces);
    let curves = Array.from(iteratePuzzleCurves(blockMetrics, rngSeed));
    let svgBody = curves.map(c => c.toSvgText()).join('\n');
    let svgText = `${SVG_HEADER}
                   <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
                        xmlns:xlink="http://www.w3.org/1999/xlink" x="0mm" y="0mm" width="${width}mm" height="${height}mm" 
                        viewBox="0 0 ${width} ${height}" 
                        enable-background="new 0 0 ${width} ${height}" 
                        xml:space="preserve">
                       ${svgBody}
                   </svg>`;
    downloadFile('puzzle.svg', svgText, 'image/svg+xml');
}

function downloadFile(filename, content, mimeType) {
    let element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// The whole program is conceived thinking HORIZONTAL, with potivive y pointing up.
// Where you see "x" and "y", think of horizontal.
// When vertical is needed, x and y are swapped.

function calculateBlockMetrics(model_width, model_height, desiredNumPieces) {
    let ideal_side = Math.sqrt((model_width * model_height) / desiredNumPieces);
    let numCols = Math.round(model_width / ideal_side);
    let block_width = model_width / numCols;
    let numRows = Math.round(model_height / ideal_side);
    let block_height = model_height / numRows;
    let actualNumPieces = numRows * numCols;
    return { model_width, model_height, numCols, block_width, numRows, block_height, actualNumPieces };
}

function* iteratePuzzleCurves(blockMetrics, rngSeed) {
    let { numRows, numCols, block_width, block_height, model_width, model_height } = blockMetrics;
    let rng = seedrandom(rngSeed);

    yield new Rectangle(0, 0, model_width, model_height);

    // Rows
    for (let rowIdx = 1; rowIdx < numRows; rowIdx += 1) {
        for (let colIdx = 0; colIdx < numCols; colIdx += 1) {
            let flip = rng() > 0.5;
            let t = Transform(block_width * colIdx, block_height * rowIdx, block_width, block_height, HORIZONTAL, flip);
            for (let curve of iter_bezier_curves(rng)) {
                yield curve.transform(t);
            }
        }
    }

    // Columns
    for (let colIdx = 1; colIdx < numCols; colIdx += 1) {
        for (let rowIdx = 0; rowIdx < numRows; rowIdx += 1) {
            let flip = rng() > 0.5;
            let t = Transform(block_width * colIdx, block_height * rowIdx, block_width, block_height, VERTICAL, flip);
            for (let curve of iter_bezier_curves(rng)) {
                yield curve.transform(t);
            }
        }
    }
}

const HORIZONTAL = 'h';
const VERTICAL = 'v';

const TOOTH_CONSTANTS = {
    base_height: Val(0.1, 0.03),
    tooth_base_middle: Val(0.5, 0.08),
    tooth_neck_width: Val(0.2, 0.04),
    tooth_left_width: Val(0.15, 0.03),
    tooth_right_width: Val(0.15, 0.03),
    tooth_height: Val(0.18, 0.04),
};

function Val(value, variability) {
    return { value, variability };
}

function iter_bezier_curves(rng) {
    let v = randomizeValues(TOOTH_CONSTANTS, rng);
    let left_neck_side = v.tooth_base_middle - v.tooth_neck_width / 2;
    let right_neck_side = 1 - left_neck_side - v.tooth_neck_width;
    let left_side = v.tooth_base_middle - v.tooth_left_width;
    let right_side = 1 - left_side - v.tooth_left_width - v.tooth_right_width;
    let tooth_total_height = v.base_height + v.tooth_height;
    let mid_tooth_total_height = v.base_height + (3 * v.tooth_height) / 5;
    let mid_tooth_height = mid_tooth_total_height - v.base_height;
    let top_tooth_height = tooth_total_height - mid_tooth_total_height;
    return iterBezierPath(
        // Left mid-low section
        FirstControlPoint(P(0, 0), P(1, 0), left_neck_side / 2),
        ControlPoint(P(left_neck_side, v.base_height), P(0, 1), (2 * v.base_height) / 3, mid_tooth_height / 2),

        // Mid-top section
        ControlPoint(P(left_side, mid_tooth_total_height), P(0, 1), mid_tooth_height / 2, top_tooth_height / 2),
        ControlPoint(P(v.tooth_base_middle, tooth_total_height), P(1, 0), v.tooth_left_width / 2, v.tooth_right_width / 2),
        ControlPoint(P(1 - right_side, mid_tooth_total_height), P(0, -1), top_tooth_height / 2, mid_tooth_height / 2),

        // Right mid-low section
        ControlPoint(P(1 - right_neck_side, v.base_height), P(0, -1), mid_tooth_height / 2, (2 * v.base_height) / 3),
        LastControlPoint(P(1, 0), P(1, 0), right_neck_side / 2)
    );
}

function randomizeValues(constants, rng) {
    let result = {};
    for (let key of Object.keys(constants)) {
        result[key] = constants[key].value + (rng() * 2 - 1) * constants[key].variability;
    }
    return result;
}

function P(x, y) {
    return new Point(x, y);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toSvg() {
        return `${this.x} ${this.y}`;
    }
}

function* iterBezierPath(start_control_point, ...other_control_points) {
    let previous_control_point = start_control_point;
    for (let next_control_point of other_control_points) {
        yield new BezierCurve(
            previous_control_point.point,
            pointOnSegment(previous_control_point.point, previous_control_point.direction, previous_control_point.length_after),
            pointOnSegment(next_control_point.point, next_control_point.direction, -next_control_point.length_before),
            next_control_point.point
        );
        previous_control_point = next_control_point;
    }
}

function pointOnSegment(a, direction, distance_from_a) {
    let direction_length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    let ratio = distance_from_a / direction_length;
    return P(a.x + direction.x * ratio, a.y + direction.y * ratio);
}

function ControlPoint(point, direction, length_before, length_after) {
    return { point, direction, length_before, length_after };
}

function FirstControlPoint(point, direction, length) {
    return { point, direction, length_after: length };
}

function LastControlPoint(point, direction, length) {
    return { point, direction, length_before: length };
}

class Rectangle {
    constructor(x, y, width, height) {
        this.a = P(x, y);
        this.b = P(x + width, y);
        this.c = P(x + width, y + height);
        this.d = P(x, y + height);
    }

    toSvgText() {
        let { a, b, c, d } = this;
        return `<path d="M ${a.toSvg()} L ${b.toSvg()} L ${c.toSvg()} L ${d.toSvg()} Z" fill="none" stroke="#000000" stroke-width="0.05pt"/>`;
    }

    toSvg(idx, screenTransform, showControlPoints) {
        let { a, b, c, d } = this;
        a = screenTransform(a);
        b = screenTransform(b);
        c = screenTransform(c);
        d = screenTransform(d);
        return <path key={idx} d={`M ${a.toSvg()} L ${b.toSvg()} L ${c.toSvg()} L ${d.toSvg()} Z`} fill="none" stroke="black" />;
    }
}

class BezierCurve {
    constructor(a, ca, cb, b) {
        this.a = a;
        this.ca = ca;
        this.cb = cb;
        this.b = b;
    }

    transform(transform) {
        return new BezierCurve(transform(this.a), transform(this.ca), transform(this.cb), transform(this.b));
    }

    toSvgText() {
        let { a, ca, cb, b } = this;
        return `<path d="M ${a.toSvg()} C ${ca.toSvg()}, ${cb.toSvg()}, ${b.toSvg()}" fill="none" stroke="#000000" stroke-width="0.05pt"/>`;
    }

    toSvg(idx, screenTransform, showControlPoints) {
        let { a, ca, cb, b } = this;
        a = screenTransform(a);
        ca = screenTransform(ca);
        cb = screenTransform(cb);
        b = screenTransform(b);
        let parts = [];
        if (showControlPoints) {
            parts = parts.concat([
                svg_circle(`${idx}ca`, ca, 'red'),
                svg_line(`${idx}a-ca`, a, ca),
                svg_circle(`${idx}cb`, cb, 'red'),
                svg_line(`${idx}b-cb`, b, cb),
                svg_circle(`${idx}a`, a, 'green'),
                svg_circle(`${idx}b`, b, 'green'),
            ]);
        }
        return parts.concat([<path key={idx} d={`M ${a.toSvg()} C ${ca.toSvg()}, ${cb.toSvg()}, ${b.toSvg()}`} fill="none" stroke="blue" />]);
    }
}

function svg_circle(key, p, color) {
    return <circle key={key} cx={p.x} cy={p.y} r={3} fill={color} />;
}

function svg_line(key, a, b) {
    return <path key={key} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="red" strokeDasharray="3,3" />;
}

function Transform(_x, _y, sx, sy, orientation, flip) {
    return p => {
        if (flip) {
            p = P(p.x, -p.y);
        }
        if (orientation === VERTICAL) {
            p = P(p.y, p.x);
        }
        let x = p.x * sx + _x;
        let y = p.y * sy + _y;
        return new Point(x, y);
    };
}

function ScreenTransform(model_height, canvas_height) {
    let ratio = canvas_height / model_height;

    return p => {
        return new Point(p.x * ratio, canvas_height - p.y * ratio);
    };
}

export default App;
