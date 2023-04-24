<script>
    import { Line } from 'svelte-chartjs';
    import { Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        Colors,
        Filler
    } from 'chart.js';

    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        Colors,
        Filler
    );

    export let data = {};

    const options = {
        aspectRatio: false,
        elements: {
            point: {
                radius: 0.1
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#ffffffd4'
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    color: '#ffffffd4'
                },
                grid: {
                    color: '#ffffff61',
                    tickColor: '#ffffff61'
                },
                border: {
                    color: '#ffffff61'
                }
            },
            x: {
                ticks: {
                    color: '#ffffffd4'
                },
                grid: {
                    display: false
                }
            }
        }
    }
</script>

<Line {data} {options} />
