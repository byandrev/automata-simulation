const { dia, shapes, elementTools, linkTools, connectors } = joint;
const { Ellipse, Rect } = g;
const { TangentDirections } = connectors.curve;

const NODE_WIDTH = 50;
const FILL_NODE_FINAL = "#e0e0e0";

const ShapeTypes = {
  BASE: "Base",
  CIRCLE: "Circle",
  LINK: "Link",
};

const connectToolAttributes = {
  fill: "none",
  "stroke-width": 10,
  "stroke-opacity": 0.4,
  stroke: "#4666E5",
  cursor: "cell",
};

const lineAttributes = {
  stroke: "#333333",
  strokeWidth: 2,
};

const labelAttributes = {
  textVerticalAnchor: "middle",
  textAnchor: "middle",
  x: "calc(.5*w)",
  y: "calc(.5*h)",
  fill: "#333333",
  fontSize: 13,
  fontWeight: "bold",
  fontFamily: "sans-serif",
  pointerEvents: "none",
};

const bodyAttributes = {
  fill: "#FCFCFC",
  stroke: "#333333",
  strokeWidth: 2,
  cursor: "grab",
};

const BaseShape = dia.Element.define(
  ShapeTypes.BASE,
  {
    z: 1,
  },
  {
    getConnectToolMarkup() {
      return [
        {
          tagName: "rect",
          attributes: {
            ...this.size(),
            ...connectToolAttributes,
          },
        },
      ];
    },

    getCurveDirection() {
      return TangentDirections.AUTO;
    },

    getBoundaryPoint(point, snapRadius = 20) {
      const bbox = this.getBBox();
      const angle = this.angle();
      // Relative to the element's position
      const relPoint = point
        .clone()
        .rotate(bbox.center(), angle)
        .difference(bbox.topLeft());
      const relBBox = new Rect(0, 0, bbox.width, bbox.height);
      if (!relBBox.containsPoint(relPoint)) {
        const relCenter = relBBox.center();
        const relTop = relBBox.topMiddle();
        const relLeft = relBBox.leftMiddle();
        if (Math.abs(relTop.x - relPoint.x) < snapRadius) {
          return relCenter.y > relPoint.y ? relTop : relBBox.bottomMiddle();
        }
        if (Math.abs(relLeft.y - relPoint.y) < snapRadius) {
          return relCenter.x > relPoint.x ? relLeft : relBBox.rightMiddle();
        }
      }
      return this.getClosestBoundaryPoint(relBBox, relPoint);
    },

    getClosestBoundaryPoint(bbox, point) {
      return bbox.pointNearestToPoint(point);
    },

    getTools() {
      return [
        new elementTools.Connect({
          focusOpacity: 0,
          markup: this.getConnectToolMarkup(),
        }),
        new joint.elementTools.Remove({
          x: "0%",
          y: "0%",
          offset: {
            x: 4,
            y: 4,
          },
        }),
      ];
    },
  }
);

const Link = shapes.standard.Link.define(
  ShapeTypes.LINK,
  {
    attrs: {
      line: {
        ...lineAttributes,
      },
    },
    z: 2,
    labels: [
      {
        attrs: {
          text: {
            text: "transition",
            fontWeight: "bold",
          },
        },
      },
    ],
  },
  {
    getTools() {
      return [
        new linkTools.Vertices(),
        new linkTools.Remove(),
        new linkTools.SourceArrowhead(),
        new linkTools.TargetArrowhead(),
      ];
    },
  }
);

const CircleShape = BaseShape.define(
  ShapeTypes.CIRCLE,
  {
    size: { width: NODE_WIDTH, height: NODE_WIDTH },
    attrs: {
      root: {
        highlighterSelector: "body",
      },
      body: {
        cx: "calc(.5*w)",
        cy: "calc(.5*h)",
        rx: "calc(.5*w)",
        ry: "calc(.5*h)",
        ...bodyAttributes,
      },
      label: {
        text: "q",
        ...labelAttributes,
      },
    },
  },
  {
    markup: [
      {
        tagName: "ellipse",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],

    getConnectToolMarkup() {
      const { width, height } = this.size();
      return [
        {
          tagName: "ellipse",
          attributes: {
            rx: width / 2,
            ry: height / 2,
            cx: width / 2,
            cy: height / 2,
            ...connectToolAttributes,
          },
        },
      ];
    },

    getCurveDirection() {
      return TangentDirections.OUTWARDS;
    },

    getClosestBoundaryPoint(bbox, point) {
      const circle = Ellipse.fromRect(bbox);
      return circle.intersectionWithLineFromCenterToPoint(point);
    },
  }
);

export {
  NODE_WIDTH,
  FILL_NODE_FINAL,
  BaseShape,
  CircleShape,
  Link,
  ShapeTypes,
};
