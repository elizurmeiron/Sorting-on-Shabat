'use strict';

/**
 * Constructor for FlowchartConnector
 * Handles drawing connections between flowchart elements on canvas
 * @param {string} canvasId - ID of the canvas element
 * @param {string} flowchartId - ID of the flowchart container
 * @param {string} connectionType - Type of connections to draw (default, hachzarah, etc.)
 */
class FlowchartConnector {
    constructor(canvasId, flowchartId, connectionType = 'default') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.flowchart = document.getElementById(flowchartId);
        this.connectionType = connectionType;

        // Color and style settings - reading actual value from CSS
        this.lineColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        this.lineWidth = 3;
        this.arrowSize = 8;

        this.init();
    }

    /**
     * Convert CSS variables to actual color values
     * @param {string} color - Color value (can be CSS variable)
     * @returns {string} Resolved color value
     */
    resolveColor(color) {
        if (color.startsWith('var(')) {
            // Extract variable name from var(--name)
            const varName = color.match(/var\((--[^)]+)\)/)[1];
            return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        }
        return color;
    }

    /**
     * Initialize the connector - set up canvas and event listeners
     */
    init() {
        this.resizeCanvas();
        this.drawConnections();

        // Debounce resize handler for better performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.drawConnections();
            }, 100);
        });
    }

    /**
     * Resize canvas to match flowchart dimensions
     */
    resizeCanvas() {
        const rect = this.flowchart.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * pixelRatio;
        this.canvas.height = rect.height * pixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.ctx.scale(pixelRatio, pixelRatio);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    /**
     * Get center position of an element
     * @param {string} elementId - ID of the element
     * @returns {Object|null} Object with x,y coordinates or null if element not found
     */
    getElementCenter(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const flowchartRect = this.flowchart.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        return {
            x: elementRect.left + elementRect.width / 2 - flowchartRect.left,
            y: elementRect.top + elementRect.height / 2 - flowchartRect.top
        };
    }

    /**
     * Get bottom center position of an element
     * @param {string} elementId - ID of the element
     * @returns {Object|null} Object with x,y coordinates or null if element not found
     */
    getElementBottom(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const flowchartRect = this.flowchart.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        return {
            x: elementRect.left + elementRect.width / 2 - flowchartRect.left,
            y: elementRect.bottom - flowchartRect.top
        };
    }

    /**
     * Get top center position of an element
     * @param {string} elementId - ID of the element
     * @returns {Object|null} Object with x,y coordinates or null if element not found
     */
    getElementTop(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const flowchartRect = this.flowchart.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        return {
            x: elementRect.left + elementRect.width / 2 - flowchartRect.left,
            y: elementRect.top - flowchartRect.top
        };
    }

    /**
     * Draw an arrow from one point to another
     * @param {number} fromX - Starting X coordinate
     * @param {number} fromY - Starting Y coordinate
     * @param {number} toX - Ending X coordinate
     * @param {number} toY - Ending Y coordinate
     * @param {string} color - Arrow color (can be CSS variable)
     */
    drawArrow(fromX, fromY, toX, toY, color = this.lineColor) {
        // Convert CSS variable color to actual value
        const resolvedColor = this.resolveColor(color);
        this.ctx.strokeStyle = resolvedColor;
        this.ctx.fillStyle = resolvedColor;
        this.ctx.lineWidth = this.lineWidth;

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        // Calculate arrow angle
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Draw arrow
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - this.arrowSize * Math.cos(angle - Math.PI / 6),
            toY - this.arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            toX - this.arrowSize * Math.cos(angle + Math.PI / 6),
            toY - this.arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw connection line between two elements
     * @param {string} fromElementId - ID of the source element
     * @param {string} toElementId - ID of the target element
     * @param {string} color - Line color (can be CSS variable)
     */
    drawConnection(fromElementId, toElementId, color = this.lineColor) {
        const fromPos = this.getElementBottom(fromElementId);
        const toPos = this.getElementTop(toElementId);

        if (!fromPos || !toPos) return;

        this.drawArrow(fromPos.x, fromPos.y, toPos.x, toPos.y, color);
    }

    /**
     * Draw all connections based on flowchart type
     */
    drawConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.connectionType === 'hachzarah') {
            // Connections for return flowchart (slide 17)
            const connections = [
                // Question 1 - cooked completely
                { from: 'question1c', to: 'q1c-yes', color: 'var(--category-gradient-start)' },
                { from: 'question1c', to: 'q1c-no', color: 'var(--category-error-start)' },

                // Question 2 - dry or liquid
                { from: 'question2c', to: 'q2c-yes', color: 'var(--category-gradient-start)' },
                { from: 'question2c', to: 'q2c-no', color: 'var(--link-color)' },

                // Question 3 - hot and boiling
                { from: 'question3c', to: 'q3c-yes', color: 'var(--category-gradient-start)' },
                { from: 'question3c', to: 'q3c-no', color: 'var(--category-error-start)' },

                // Question 4 - covered fire
                { from: 'question4c', to: 'q4c-yes', color: 'var(--category-gradient-start)' },
                { from: 'question4c', to: 'q4c-no', color: 'var(--category-error-start)' },

                // Question 5 - intended to return
                { from: 'question5c', to: 'q5c-yes', color: 'var(--category-gradient-start)' },
                { from: 'question5c', to: 'q5c-no', color: 'var(--category-error-start)' },

                // Question 6 - held in hand
                { from: 'question6c', to: 'q6c-yes', color: 'var(--category-gradient-start)' },
                { from: 'question6c', to: 'q6c-maybe', color: '#ed8936' }
            ];

            connections.forEach(conn => {
                this.drawConnection(conn.from, conn.to, conn.color);
            });
        } else {
            // Connections between questions and answers (original delay flowchart - slide 13)
            const connections = [
                // Question 1 to answers
                { from: 'question1', to: 'q1-yes', color: 'var(--category-gradient-start)' },
                { from: 'question1', to: 'q1-no', color: 'var(--category-error-start)' },

                // Question 2 to answers  
                { from: 'question2', to: 'q2-yes', color: 'var(--category-gradient-start)' },
                { from: 'question2', to: 'q2-no', color: 'var(--category-error-start)' },

                // Question 3 to answers
                { from: 'question3', to: 'q3-yes', color: 'var(--category-gradient-start)' },
                { from: 'question3', to: 'q3-no', color: 'var(--category-error-start)' }
            ];

            connections.forEach(conn => {
                this.drawConnection(conn.from, conn.to, conn.color);
            });
        }
    }
}
