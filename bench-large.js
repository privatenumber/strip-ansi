import { run, bench, summary, boxplot } from 'mitata';
import stripAnsi from './index.js';

// === Simulate realistic PTY/log output ===
// Colored log line: timestamp + level + message
const coloredLine = '\u001B[90m2024-01-15T10:30:00Z\u001B[39m \u001B[32mINFO\u001B[39m  Processing request from \u001B[36m192.168.1.1\u001B[39m - status \u001B[33m200\u001B[39m\n';
const plainLine = '2024-01-15T10:30:00Z INFO  Processing request from 192.168.1.1 - status 200\n';

// Build at different scales
const colored1k = coloredLine.repeat(Math.ceil(1_000 / coloredLine.length)).slice(0, 1_000);
const colored10k = coloredLine.repeat(Math.ceil(10_000 / coloredLine.length)).slice(0, 10_000);
const colored100k = coloredLine.repeat(Math.ceil(100_000 / coloredLine.length)).slice(0, 100_000);
const colored1M = coloredLine.repeat(Math.ceil(1_000_000 / coloredLine.length)).slice(0, 1_000_000);
const colored5M = coloredLine.repeat(Math.ceil(5_000_000 / coloredLine.length)).slice(0, 5_000_000);

const plain1k = plainLine.repeat(Math.ceil(1_000 / plainLine.length)).slice(0, 1_000);
const plain10k = plainLine.repeat(Math.ceil(10_000 / plainLine.length)).slice(0, 10_000);
const plain100k = plainLine.repeat(Math.ceil(100_000 / plainLine.length)).slice(0, 100_000);
const plain1M = plainLine.repeat(Math.ceil(1_000_000 / plainLine.length)).slice(0, 1_000_000);
const plain5M = plainLine.repeat(Math.ceil(5_000_000 / plainLine.length)).slice(0, 5_000_000);

// Worst case: ANSI only at the very end (includes scans entire string before finding ESC)
const ansiEnd1k = 'a'.repeat(1_000) + '\u001B[31mx\u001B[0m';
const ansiEnd10k = 'a'.repeat(10_000) + '\u001B[31mx\u001B[0m';
const ansiEnd100k = 'a'.repeat(100_000) + '\u001B[31mx\u001B[0m';
const ansiEnd1M = 'a'.repeat(1_000_000) + '\u001B[31mx\u001B[0m';
const ansiEnd5M = 'a'.repeat(5_000_000) + '\u001B[31mx\u001B[0m';

console.log('String sizes:');
console.log(`  colored1k:  ${colored1k.length} chars`);
console.log(`  colored10k: ${colored10k.length} chars`);
console.log(`  colored100k: ${colored100k.length} chars`);
console.log(`  colored1M:  ${colored1M.length} chars`);
console.log(`  colored5M:  ${colored5M.length} chars`);
console.log(`  ansiEnd5M:  ${ansiEnd5M.length} chars`);
console.log();

// Realistic: colored log output (ANSI throughout — includes finds ESC immediately)
boxplot(() => {
	summary(() => {
		bench('colored log 1 KB', () => stripAnsi(colored1k));
		bench('colored log 10 KB', () => stripAnsi(colored10k));
		bench('colored log 100 KB', () => stripAnsi(colored100k));
		bench('colored log 1 MB', () => stripAnsi(colored1M));
		bench('colored log 5 MB', () => stripAnsi(colored5M));
	});
});

// Plain text log (no ANSI — fast path)
boxplot(() => {
	summary(() => {
		bench('plain log 1 KB', () => stripAnsi(plain1k));
		bench('plain log 10 KB', () => stripAnsi(plain10k));
		bench('plain log 100 KB', () => stripAnsi(plain100k));
		bench('plain log 1 MB', () => stripAnsi(plain1M));
		bench('plain log 5 MB', () => stripAnsi(plain5M));
	});
});

// Worst case: ANSI only at end (includes scans full string, then regex scans again)
boxplot(() => {
	summary(() => {
		bench('ansi-at-end 1 KB', () => stripAnsi(ansiEnd1k));
		bench('ansi-at-end 10 KB', () => stripAnsi(ansiEnd10k));
		bench('ansi-at-end 100 KB', () => stripAnsi(ansiEnd100k));
		bench('ansi-at-end 1 MB', () => stripAnsi(ansiEnd1M));
		bench('ansi-at-end 5 MB', () => stripAnsi(ansiEnd5M));
	});
});

await run();
