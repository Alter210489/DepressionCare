import { Link } from "@inertiajs/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface LinkProps {
    active : boolean;
    label : string;
    url : string | null;
}

interface PaginationData {
    links: LinkProps[];
    from: number;
    to: number;
    total: number;
}

interface PaginationProps {
    gejalas : PaginationData;
    perPage : string;
    onPerPageChange: (value: string) => void;
}

export const Pagination = ({ gejalas, perPage, onPerPageChange } : PaginationProps) => {

    console.log(perPage);

    return (
        <div className="flex items-center justify-between mt-4">

            <p>Showing <strong>{gejalas.from}</strong> to <strong>{gejalas.to}</strong> from <strong>{gejalas.total}</strong> entries</p>

            {/* Select Per Page */}
            <div className="flex items-center gap-2">
                <span className="text-sm">Row per page:</span>
                <Select onValueChange={onPerPageChange} value={perPage}>
                    <SelectTrigger className="w-[90px]">
                        <SelectValue placeholder="Row" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="-1">All</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Pagination Link */}
            <div className="flex gap-2">
                {gejalas.links.map((link, index) => (
                    <Link
                        className={`px-3 py-2 border rounded ${link.active ?'bg-gray-700 text-white' : ''}`}
                        href={link.url || '#'}
                        key={index}
                        dangerouslySetInnerHTML={{  __html: link.label }}
                    />
                ))}
            </div>
        </div>
    )
}
